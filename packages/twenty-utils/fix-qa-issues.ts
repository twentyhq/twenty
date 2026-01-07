/**
 * Script to fix QA issues detected by Crowdin
 *
 * Fixes:
 * - Variables mismatch (translated placeholder names)
 * - Empty translations
 * - Tags mismatch
 *
 * Usage:
 *   CROWDIN_PERSONAL_TOKEN=xxx npx ts-node packages/twenty-utils/fix-qa-issues.ts
 */

const CROWDIN_BASE_URL = 'https://twenty.api.crowdin.com/api/v2';
const CROWDIN_PROJECT_ID = 1;

type QACheck = {
  stringId: number;
  languageId: string;
  category: string;
  validation: string;
  text: string;
};

async function getToken(): Promise<string> {
  const token = process.env.CROWDIN_PERSONAL_TOKEN;

  if (!token) {
    console.error('Error: CROWDIN_PERSONAL_TOKEN not set');
    process.exit(1);
  }

  return token;
}

async function crowdinGet<T>(endpoint: string, token: string): Promise<T> {
  const response = await fetch(`${CROWDIN_BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function getSourceString(
  token: string,
  stringId: number,
): Promise<string> {
  type Response = { data: { text: string } };
  const data = await crowdinGet<Response>(
    `/projects/${CROWDIN_PROJECT_ID}/strings/${stringId}`,
    token,
  );

  return data.data.text;
}

async function getTranslation(
  token: string,
  stringId: number,
  languageId: string,
): Promise<{ translationId: number; text: string } | null> {
  type Response = {
    data: Array<{ data: { translationId: number; text: string } }>;
  };
  const data = await crowdinGet<Response>(
    `/projects/${CROWDIN_PROJECT_ID}/languages/${languageId}/translations?stringIds=${stringId}`,
    token,
  );

  if (data.data.length === 0) return null;

  return {
    translationId: data.data[0].data.translationId,
    text: data.data[0].data.text,
  };
}

async function deleteTranslation(
  token: string,
  translationId: number,
): Promise<void> {
  const response = await fetch(
    `${CROWDIN_BASE_URL}/projects/${CROWDIN_PROJECT_ID}/translations/${translationId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(`Delete failed: ${response.status}`);
  }
}

async function addTranslation(
  token: string,
  stringId: number,
  languageId: string,
  text: string,
): Promise<void> {
  const response = await fetch(
    `${CROWDIN_BASE_URL}/projects/${CROWDIN_PROJECT_ID}/translations`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stringId, languageId, text }),
    },
  );

  // OK if added or if identical exists
  if (!response.ok) {
    const data = await response.json();
    const msg = JSON.stringify(data);

    if (!msg.includes('identical')) {
      throw new Error(`Add failed: ${msg}`);
    }
  }
}

// Extract placeholder names from text (e.g., {days}, {count}, ${price})
function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\$?\{[a-zA-Z_][a-zA-Z0-9_]*\}/g) || [];

  return [...new Set(matches)];
}

// Fix translated placeholder names back to source names
function fixPlaceholderNames(
  sourceText: string,
  translationText: string,
): string | null {
  const sourcePlaceholders = extractPlaceholders(sourceText);
  const translationPlaceholders = extractPlaceholders(translationText);

  if (sourcePlaceholders.length === 0) return null;

  // Check if any placeholders were translated
  const missingInTranslation = sourcePlaceholders.filter(
    (p) => !translationPlaceholders.includes(p),
  );

  if (missingInTranslation.length === 0) return null;

  // Try to find translated versions and replace them
  let fixedText = translationText;

  for (const sourcePlaceholder of missingInTranslation) {
    // Extract the name from source placeholder
    const sourceNameMatch = sourcePlaceholder.match(/\$?\{([^}]+)\}/);

    if (!sourceNameMatch) continue;

    const sourceName = sourceNameMatch[1];

    // Find potential translations of this placeholder
    // Common patterns: {days} -> {jours}, {dae}, {dni}, {días}, etc.
    for (const transPlaceholder of translationPlaceholders) {
      const transNameMatch = transPlaceholder.match(/\$?\{([^}]+)\}/);

      if (!transNameMatch) continue;

      const transName = transNameMatch[1];

      // If trans placeholder is not in source, it might be a translated version
      if (
        !sourcePlaceholders.includes(transPlaceholder) &&
        transName !== sourceName
      ) {
        // Check if this looks like a translation of the source name
        // (same position in ICU structure, similar pattern)

        // For ICU plural messages, check if the placeholder appears in same position
        const sourcePattern = new RegExp(
          `\\{${sourceName}\\}`,
          'g',
        );
        const transPattern = new RegExp(`\\{${transName}\\}`, 'g');

        const sourceMatches = sourceText.match(sourcePattern)?.length || 0;
        const transMatches = translationText.match(transPattern)?.length || 0;

        if (sourceMatches > 0 && transMatches > 0 && sourceMatches === transMatches) {
          // Replace translated placeholder with source placeholder
          fixedText = fixedText.replace(
            new RegExp(`\\{${transName}\\}`, 'g'),
            `{${sourceName}}`,
          );
          console.log(`    Replacing {${transName}} -> {${sourceName}}`);
        }
      }
    }

    // Handle $ prefix for currency
    if (sourcePlaceholder.startsWith('$')) {
      const withoutDollar = sourcePlaceholder.slice(1);

      if (translationText.includes(withoutDollar)) {
        fixedText = fixedText.replace(withoutDollar, sourcePlaceholder);
        console.log(`    Adding $ prefix: ${withoutDollar} -> ${sourcePlaceholder}`);
      }
    }
  }

  // Return null if nothing changed
  if (fixedText === translationText) return null;

  return fixedText;
}

async function fetchQAChecks(
  token: string,
  category: string,
): Promise<QACheck[]> {
  const checks: QACheck[] = [];
  let offset = 0;

  while (true) {
    type Response = { data: Array<{ data: QACheck }> };
    const data = await crowdinGet<Response>(
      `/projects/${CROWDIN_PROJECT_ID}/qa-checks?limit=500&offset=${offset}&category=${category}`,
      token,
    );

    if (data.data.length === 0) break;

    for (const item of data.data) {
      checks.push(item.data);
    }

    if (data.data.length < 500) break;
    offset += 500;
  }

  return checks;
}

async function fixVariablesIssues(token: string): Promise<number> {
  console.log('\n=== Fixing Variables Mismatch Issues ===\n');

  const checks = await fetchQAChecks(token, 'variables');

  console.log(`Found ${checks.length} variables issues\n`);

  let fixed = 0;

  for (const check of checks) {
    console.log(
      `String ${check.stringId} (${check.languageId}): ${check.text.slice(0, 80)}...`,
    );

    try {
      const sourceText = await getSourceString(token, check.stringId);
      const translation = await getTranslation(
        token,
        check.stringId,
        check.languageId,
      );

      if (!translation) {
        console.log('  -> No translation found, skipping\n');
        continue;
      }

      const fixedText = fixPlaceholderNames(sourceText, translation.text);

      if (!fixedText) {
        console.log('  -> Could not auto-fix, manual review needed\n');
        continue;
      }

      console.log(`  Source: ${sourceText.slice(0, 60)}...`);
      console.log(`  Before: ${translation.text.slice(0, 60)}...`);
      console.log(`  After:  ${fixedText.slice(0, 60)}...`);

      // Delete old translation and add fixed one
      await deleteTranslation(token, translation.translationId);
      await addTranslation(token, check.stringId, check.languageId, fixedText);

      console.log('  -> Fixed!\n');
      fixed++;
    } catch (error) {
      console.log(`  -> Error: ${error}\n`);
    }
  }

  return fixed;
}

async function fixEmptyTranslations(token: string): Promise<number> {
  console.log('\n=== Fixing Empty Translation Issues ===\n');

  const checks = await fetchQAChecks(token, 'empty');

  console.log(`Found ${checks.length} empty translation issues\n`);

  // Empty translations should be deleted so they fall back to source
  let fixed = 0;

  for (const check of checks) {
    console.log(`String ${check.stringId} (${check.languageId})`);

    try {
      const translation = await getTranslation(
        token,
        check.stringId,
        check.languageId,
      );

      if (!translation) {
        console.log('  -> No translation found\n');
        continue;
      }

      if (translation.text.trim() === '') {
        await deleteTranslation(token, translation.translationId);
        console.log('  -> Deleted empty translation\n');
        fixed++;
      }
    } catch (error) {
      console.log(`  -> Error: ${error}\n`);
    }
  }

  return fixed;
}

async function fixTagsIssues(token: string): Promise<number> {
  console.log('\n=== Fixing Tags Mismatch Issues ===\n');

  const checks = await fetchQAChecks(token, 'tags');

  console.log(`Found ${checks.length} tags issues\n`);

  let fixed = 0;

  for (const check of checks) {
    console.log(`String ${check.stringId} (${check.languageId}): ${check.text.slice(0, 60)}...`);

    try {
      const sourceText = await getSourceString(token, check.stringId);
      const translation = await getTranslation(
        token,
        check.stringId,
        check.languageId,
      );

      if (!translation) {
        console.log('  -> No translation found\n');
        continue;
      }

      // Extract tags from source and translation
      const sourceTags = sourceText.match(/<\/?[a-zA-Z][^>]*>/g) || [];
      const translationTags = translation.text.match(/<\/?[a-zA-Z][^>]*>/g) || [];

      // If translation has extra tags not in source, remove them
      if (check.text.includes('extra formatting tags')) {
        let fixedText = translation.text;

        for (const tag of translationTags) {
          if (!sourceTags.includes(tag)) {
            // Remove extra tag
            fixedText = fixedText.replace(new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
          }
        }

        // Clean up any double spaces
        fixedText = fixedText.replace(/\s+/g, ' ').trim();

        if (fixedText !== translation.text) {
          console.log(`  Source: ${sourceText.slice(0, 60)}`);
          console.log(`  Before: ${translation.text.slice(0, 60)}`);
          console.log(`  After:  ${fixedText.slice(0, 60)}`);

          await deleteTranslation(token, translation.translationId);
          await addTranslation(token, check.stringId, check.languageId, fixedText);

          console.log('  -> Fixed!\n');
          fixed++;
        } else {
          console.log('  -> Could not auto-fix\n');
        }
      } else {
        console.log('  -> Manual review needed\n');
      }
    } catch (error) {
      console.log(`  -> Error: ${error}\n`);
    }
  }

  return fixed;
}

async function main() {
  const token = await getToken();

  console.log('Crowdin QA Issues Fixer\n');
  console.log('This script will fix:');
  console.log('- Variables mismatch (translated placeholder names)');
  console.log('- Empty translations');
  console.log('- Tags mismatch (extra formatting tags)\n');

  let totalFixed = 0;

  // Fix variables issues
  totalFixed += await fixVariablesIssues(token);

  // Fix empty translations
  totalFixed += await fixEmptyTranslations(token);

  // Fix tags issues
  totalFixed += await fixTagsIssues(token);

  console.log(`\n=== Done! Fixed ${totalFixed} issues ===`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

