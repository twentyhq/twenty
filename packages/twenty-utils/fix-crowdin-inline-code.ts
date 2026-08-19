/**
 * Repairs escaped inline-code tags in Crowdin translations so Crowdin's mdx_v2
 * builder can always rebuild translated MDX.
 *
 * Why this exists:
 * The mdx_v2 parser has no option to protect inline code (`exclude_code_blocks`
 * only covers fenced blocks). Inline code that holds a tag — e.g. `<img>`, `<path>`,
 * `<Trans>` — is sent for translation, and the translation step (AI/MT/human)
 * sometimes HTML-escapes the angle brackets (`<img>` becomes `&lt;img&gt;`). One such
 * string fails the whole language build, so every other translated page in that
 * language goes stale.
 *
 * Inline code should be identical across languages (nobody translates a tag), so the
 * repair simply restores the escaped angle brackets to their raw form.
 *
 * Usage:
 *   # Dry-run (read-only), default project 2 (docs)
 *   CROWDIN_PERSONAL_TOKEN=xxx npx tsx packages/twenty-utils/fix-crowdin-inline-code.ts
 *
 *   # Apply the repair
 *   CROWDIN_PERSONAL_TOKEN=xxx npx tsx packages/twenty-utils/fix-crowdin-inline-code.ts --apply
 *
 *   # Target a different project
 *   CROWDIN_PERSONAL_TOKEN=xxx npx tsx packages/twenty-utils/fix-crowdin-inline-code.ts --project=4
 *
 * The token can be obtained from: https://twenty.crowdin.com/u/settings#api-key
 */

const CROWDIN_BASE_URL = 'https://twenty.api.crowdin.com/api/v2';

const PROJECT_ARG = process.argv.find((arg: string) =>
  arg.startsWith('--project='),
);
const CROWDIN_PROJECT_ID = PROJECT_ARG ? Number(PROJECT_ARG.split('=')[1]) : 2;
const APPLY = process.argv.includes('--apply');

const FETCH_CONCURRENCY = 10;

type CrowdinTranslation = {
  stringId: number;
  translationId: number;
  text: string;
};

type CorruptionFinding = {
  languageId: string;
  stringId: number;
  translationId: number;
  sourceText: string;
  translationText: string;
  fixedText: string;
};

async function getToken(): Promise<string> {
  const token = process.env.CROWDIN_PERSONAL_TOKEN;

  if (!token) {
    console.error('Error: CROWDIN_PERSONAL_TOKEN environment variable not set');
    console.error(
      'Get your token from: https://twenty.crowdin.com/u/settings#api-key',
    );
    process.exit(1);
  }

  return token;
}

async function crowdinRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T | null> {
  const url = `${CROWDIN_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    const text = await response.text();
    throw new Error(`Crowdin API error: ${response.status} ${text}`);
  }

  const text = await response.text();

  if (!text) return null;

  return JSON.parse(text) as T;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  handler: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = Array.from({ length: items.length });
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await handler(items[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );

  return results;
}

async function getProjectLanguages(token: string): Promise<string[]> {
  type ProjectResponse = {
    data: {
      targetLanguageIds: string[];
    };
  };

  const response = await crowdinRequest<ProjectResponse>(
    `/projects/${CROWDIN_PROJECT_ID}`,
    token,
  );

  return response?.data.targetLanguageIds || [];
}

// Matches inline-code spans: `...` (single backtick pairs, no newline inside)
const INLINE_CODE_REGEX = /`([^`\n]+)`/g;

function inlineCodeHasTag(text: string): boolean {
  let match: RegExpExecArray | null;

  while ((match = INLINE_CODE_REGEX.exec(text)) !== null) {
    if (match[1].includes('<') || match[1].includes('>')) {
      INLINE_CODE_REGEX.lastIndex = 0;

      return true;
    }
  }

  return false;
}

// The build-breaking signature: escaped angle brackets in a translation
const ESCAPED_TAG_REGEX = /&lt;|&gt;|&#0*60;|&#0*62;/i;

function hasEscapedTag(text: string): boolean {
  return ESCAPED_TAG_REGEX.test(text);
}

function unescapeTags(text: string): string {
  return text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#0*60;/g, '<')
    .replace(/&#0*62;/g, '>');
}

async function getSourceStringsWithTagCode(
  token: string,
): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  let offset = 0;
  const limit = 500;

  while (true) {
    type StringsResponse = {
      data: Array<{
        data: {
          id: number;
          text: string | Record<string, string>;
        };
      }>;
    };

    const response = await crowdinRequest<StringsResponse>(
      `/projects/${CROWDIN_PROJECT_ID}/strings?limit=${limit}&offset=${offset}`,
      token,
    );

    if (!response || response.data.length === 0) break;

    for (const item of response.data) {
      const text = item.data.text;

      if (typeof text !== 'string') continue;
      if (!inlineCodeHasTag(text)) continue;

      result.set(item.data.id, text);
    }

    if (response.data.length < limit) break;
    offset += limit;
  }

  return result;
}

async function getStringTranslations(
  token: string,
  stringId: number,
  languageId: string,
): Promise<CrowdinTranslation[]> {
  type TranslationsResponse = {
    data: Array<{
      data: {
        id: number;
        text: string;
      };
    }>;
  };

  const response = await crowdinRequest<TranslationsResponse>(
    `/projects/${CROWDIN_PROJECT_ID}/translations?stringId=${stringId}&languageId=${languageId}&limit=100`,
    token,
  );

  if (!response) return [];

  return response.data.map((item) => ({
    stringId,
    translationId: item.data.id,
    text: item.data.text,
  }));
}

async function deleteTranslation(
  token: string,
  translationId: number,
): Promise<boolean> {
  const result = await crowdinRequest(
    `/projects/${CROWDIN_PROJECT_ID}/translations/${translationId}`,
    token,
    { method: 'DELETE' },
  );

  return result === null;
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

  const data = (await response.json()) as {
    errors?: Array<{ error?: { errors?: Array<{ message?: string }> } }>;
  };
  const errorMsg = data?.errors?.[0]?.error?.errors?.[0]?.message || '';

  if (errorMsg.includes('identical')) return true;

  throw new Error(`Failed to add translation: ${JSON.stringify(data)}`);
}

async function main() {
  const token = await getToken();

  console.log(
    `Project ${CROWDIN_PROJECT_ID} — inline-code repair (${APPLY ? 'APPLY' : 'DRY-RUN'})`,
  );

  console.log('Fetching source strings with tag-bearing inline code...');
  const sourceStrings = await getSourceStringsWithTagCode(token);
  console.log(`  ${sourceStrings.size} source strings carry inline-code tags`);

  if (sourceStrings.size === 0) {
    console.log('Nothing to scan.');
    return;
  }

  const languages = await getProjectLanguages(token);
  console.log(`Languages: ${languages.length}`);

  const lookups: Array<{
    stringId: number;
    sourceText: string;
    languageId: string;
  }> = [];

  for (const [stringId, sourceText] of sourceStrings) {
    for (const languageId of languages) {
      lookups.push({ stringId, sourceText, languageId });
    }
  }

  console.log(`Scanning ${lookups.length} string/language pairs...`);

  const findingsPerLookup = await mapWithConcurrency(
    lookups,
    FETCH_CONCURRENCY,
    async ({ stringId, sourceText, languageId }) => {
      const translations = await getStringTranslations(
        token,
        stringId,
        languageId,
      );

      return translations
        .filter((translation) => hasEscapedTag(translation.text))
        .map(
          (translation): CorruptionFinding => ({
            languageId,
            stringId: translation.stringId,
            translationId: translation.translationId,
            sourceText,
            translationText: translation.text,
            fixedText: unescapeTags(translation.text),
          }),
        );
    },
  );

  const findings = findingsPerLookup.flat();

  console.log(`\n=== Found ${findings.length} corrupted translation(s) ===`);

  for (const finding of findings.slice(0, 15)) {
    console.log(`\n[${finding.languageId}] string ${finding.stringId}`);
    console.log(`  source: ${finding.sourceText}`);
    console.log(`  trans:  ${finding.translationText}`);
    console.log(`  fixed:  ${finding.fixedText}`);
  }

  if (findings.length === 0) {
    console.log('No escaped inline-code tags. Nothing to repair.');
    return;
  }

  if (!APPLY) {
    console.log('\nDry-run only. Re-run with --apply to repair.');
    return;
  }

  console.log('\n=== Applying repairs ===');
  let repaired = 0;

  for (const finding of findings) {
    try {
      await deleteTranslation(token, finding.translationId);
      await addTranslation(
        token,
        finding.stringId,
        finding.languageId,
        finding.fixedText,
      );

      repaired++;
      process.stdout.write('.');
    } catch (error) {
      console.log(
        `\n  Failed to repair string ${finding.stringId} (${finding.languageId}): ${error}`,
      );
    }
  }

  console.log(`\nDone! Repaired ${repaired} translation(s) in Crowdin.`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
