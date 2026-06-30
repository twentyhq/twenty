/**
 * Script to fix encoding issues in Crowdin translations
 *
 * This script:
 * 1. Fetches translations from Crowdin API that have escaped Unicode sequences
 * 2. Deletes the corrupted translations
 * 3. Adds corrected translations (or activates existing corrected suggestions)
 *
 * Usage:
 *   CROWDIN_PERSONAL_TOKEN=xxx npx ts-node packages/twenty-utils/fix-crowdin-translations.ts
 *
 * The token can be obtained from: https://twenty.crowdin.com/u/settings#api-key
 */

const CROWDIN_BASE_URL = 'https://twenty.api.crowdin.com/api/v2';
const CROWDIN_PROJECT_ID = 1;

type CrowdinTranslation = {
  stringId: number;
  translationId: number;
  text: string;
};

async function getToken(): Promise<string> {
  const token = process.env.CROWDIN_PERSONAL_TOKEN;

  if (!token) {
    console.error(
      'Error: CROWDIN_PERSONAL_TOKEN environment variable not set',
    );
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

async function getTranslationsForLanguage(
  token: string,
  languageId: string,
): Promise<CrowdinTranslation[]> {
  const translations: CrowdinTranslation[] = [];
  let offset = 0;
  const limit = 500;

  while (true) {
    type TranslationsResponse = {
      data: Array<{
        data: {
          stringId: number;
          translationId: number;
          text: string;
        };
      }>;
    };

    const response = await crowdinRequest<TranslationsResponse>(
      `/projects/${CROWDIN_PROJECT_ID}/languages/${languageId}/translations?limit=${limit}&offset=${offset}`,
      token,
    );

    if (!response || response.data.length === 0) break;

    for (const item of response.data) {
      translations.push({
        stringId: item.data.stringId,
        translationId: item.data.translationId,
        text: item.data.text,
      });
    }

    if (response.data.length < limit) break;
    offset += limit;
  }

  return translations;
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

  return result === null; // null means success (empty response)
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

  // Success if added OR if identical already exists (meaning correct version is now active)
  if (response.ok) return true;

  const data = (await response.json()) as { errors?: Array<{ error?: { errors?: Array<{ message?: string }> } }> };
  const errorMsg = data?.errors?.[0]?.error?.errors?.[0]?.message || '';

  // "Identical translation already saved" means the correct version was already a suggestion
  // and is now the active translation after we deleted the corrupted one
  if (errorMsg.includes('identical')) return true;

  throw new Error(`Failed to add translation: ${JSON.stringify(data)}`);
}

function hasEscapedUnicode(text: string): boolean {
  // Match literal \uXXXX sequences in the text
  // The text comes JSON-decoded, so \\u in the original becomes \u in the string
  return /\\u[0-9a-fA-F]{4}/.test(text);
}

function fixEscapedUnicode(text: string): string {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_match, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return _match;
    }
  });
}

async function main() {
  const token = await getToken();

  console.log('Fetching project languages...');
  const languages = await getProjectLanguages(token);
  console.log(`Languages: ${languages.length}`);

  let totalFixed = 0;

  for (const languageId of languages) {
    process.stdout.write(`Checking ${languageId}...`);

    try {
      const translations = await getTranslationsForLanguage(token, languageId);

      // Find translations with escaped Unicode
      const toFix = translations.filter((t) => hasEscapedUnicode(t.text));

      if (toFix.length === 0) {
        console.log(` ${translations.length} translations, 0 issues`);
        continue;
      }

      console.log(
        ` ${translations.length} translations, ${toFix.length} to fix`,
      );

      let fixedInLang = 0;

      // Fix each translation
      for (const translation of toFix) {
        const fixedText = fixEscapedUnicode(translation.text);

        try {
          // Delete the corrupted translation
          await deleteTranslation(token, translation.translationId);

          // Add the corrected translation (or let existing suggestion become active)
          await addTranslation(
            token,
            translation.stringId,
            languageId,
            fixedText,
          );

          fixedInLang++;
          totalFixed++;
          process.stdout.write('.');
        } catch (error) {
          console.log(
            `\n  Failed to fix string ${translation.stringId}: ${error}`,
          );
        }
      }

      if (fixedInLang > 0) {
        console.log(` ✓ Fixed ${fixedInLang}`);
      }
    } catch (error) {
      console.log(` error: ${error}`);
    }
  }

  console.log(`\nDone! Fixed ${totalFixed} translations in Crowdin.`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
