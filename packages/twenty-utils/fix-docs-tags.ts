/**
 * Script to fix HTML tags in MDX translations that should use Markdown
 *
 * Problem: Some translations use HTML tags (<strong>, <b>, <em>, <i>) instead of
 * Markdown syntax (**, *) causing QA issues and potentially breaking Crowdin builds.
 *
 * Usage:
 *   CROWDIN_PERSONAL_TOKEN=xxx npx ts-node packages/twenty-utils/fix-docs-tags.ts
 */

const CROWDIN_BASE_URL = 'https://twenty.api.crowdin.com/api/v2';
const CROWDIN_PROJECT_ID = 2; // Docs project

type QAIssue = {
  stringId: number;
  languageId: string;
  validation: string;
};

type Translation = {
  stringId: number;
  translationId: number;
  text: string;
};

type CrowdinErrorResponse = {
  errors?: Array<{
    error?: {
      errors?: Array<{
        message?: string;
      }>;
    };
  }>;
};

async function getToken(): Promise<string> {
  const token = process.env.CROWDIN_PERSONAL_TOKEN;

  if (!token) {
    console.error(
      'Error: CROWDIN_PERSONAL_TOKEN environment variable not set',
    );
    process.exit(1);
  }

  return token;
}

async function fetchTagsQAIssues(token: string): Promise<QAIssue[]> {
  const issues: QAIssue[] = [];
  let offset = 0;
  const limit = 500;

  console.log('Fetching tags QA issues from Crowdin...');

  while (true) {
    const url = `${CROWDIN_BASE_URL}/projects/${CROWDIN_PROJECT_ID}/qa-checks?limit=${limit}&offset=${offset}&category=tags`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Crowdin API error: ${response.status}`);
    }

    type QAResponse = {
      data: Array<{ data: QAIssue }>;
    };

    const data = (await response.json()) as QAResponse;

    if (data.data.length === 0) break;

    for (const item of data.data) {
      issues.push(item.data);
    }

    if (data.data.length < limit) break;
    offset += limit;
  }

  return issues;
}

async function getTranslation(
  token: string,
  stringId: number,
  languageId: string,
): Promise<Translation | null> {
  const url = `${CROWDIN_BASE_URL}/projects/${CROWDIN_PROJECT_ID}/languages/${languageId}/translations?stringIds=${stringId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Failed to get translation for string ${stringId}`);
    return null;
  }

  type TransResponse = {
    data: Array<{
      data: Translation;
    }>;
  };

  const data = (await response.json()) as TransResponse;

  return data.data[0]?.data || null;
}

async function deleteTranslation(
  token: string,
  translationId: number,
): Promise<boolean> {
  const url = `${CROWDIN_BASE_URL}/projects/${CROWDIN_PROJECT_ID}/translations/${translationId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.ok || response.status === 404;
}

async function addTranslation(
  token: string,
  stringId: number,
  languageId: string,
  text: string,
): Promise<boolean> {
  const url = `${CROWDIN_BASE_URL}/projects/${CROWDIN_PROJECT_ID}/translations`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stringId, languageId, text }),
  });

  if (response.ok) return true;

  const data = (await response.json()) as CrowdinErrorResponse;
  const errorMsg = data?.errors?.[0]?.error?.errors?.[0]?.message ?? '';

  // Identical translation already exists - that's fine
  if (errorMsg.includes('identical')) return true;

  console.error(`Failed to add translation: ${JSON.stringify(data)}`);
  return false;
}

function fixHtmlTags(text: string): string {
  let fixed = text;

  // Fix bold: <strong>...</strong> or <b>...</b> → **...**
  fixed = fixed.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  fixed = fixed.replace(/<b>(.*?)<\/b>/gi, '**$1**');

  // Fix italic: <em>...</em> or <i>...</i> → *...*
  fixed = fixed.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  fixed = fixed.replace(/<i>(.*?)<\/i>/gi, '*$1*');

  // Fix code: <code>...</code> → `...`
  fixed = fixed.replace(/<code>(.*?)<\/code>/gi, '`$1`');

  return fixed;
}

function hasHtmlFormattingTags(text: string): boolean {
  return /<(strong|b|em|i|code)[^>]*>/i.test(text);
}

async function main() {
  const token = await getToken();

  const issues = await fetchTagsQAIssues(token);
  console.log(`Found ${issues.length} tags QA issues`);

  if (issues.length === 0) {
    console.log('No tags issues to fix!');
    return;
  }

  // Group by stringId + languageId to avoid duplicates
  const uniqueIssues = new Map<string, QAIssue>();
  for (const issue of issues) {
    const key = `${issue.stringId}-${issue.languageId}`;
    uniqueIssues.set(key, issue);
  }

  console.log(`Processing ${uniqueIssues.size} unique string-language pairs...`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const [key, issue] of uniqueIssues) {
    const translation = await getTranslation(
      token,
      issue.stringId,
      issue.languageId,
    );

    if (!translation) {
      console.log(`  [${key}] No translation found, skipping`);
      skipped++;
      continue;
    }

    if (!hasHtmlFormattingTags(translation.text)) {
      console.log(`  [${key}] No HTML formatting tags, skipping`);
      skipped++;
      continue;
    }

    const fixedText = fixHtmlTags(translation.text);

    if (fixedText === translation.text) {
      console.log(`  [${key}] No changes needed, skipping`);
      skipped++;
      continue;
    }

    console.log(`  [${key}] Fixing HTML tags...`);

    // Delete old translation
    const deleted = await deleteTranslation(token, translation.translationId);
    if (!deleted) {
      console.error(`  [${key}] Failed to delete old translation`);
      errors++;
      continue;
    }

    // Add corrected translation
    const added = await addTranslation(
      token,
      issue.stringId,
      issue.languageId,
      fixedText,
    );

    if (added) {
      console.log(`  [${key}] ✓ Fixed`);
      fixed++;
    } else {
      errors++;
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`
Done!
  Fixed: ${fixed}
  Skipped: ${skipped}
  Errors: ${errors}
`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

