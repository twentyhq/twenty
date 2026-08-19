/**
 * Normalizes Crowdin translations that were mechanically corrupted during the
 * translation step (MT / AI / human), so Crowdin's builder can always rebuild
 * valid output and downstream builds (Mintlify, Lingui) don't go stale.
 *
 * Why a single engine with rules:
 * Every corruption class we have hit is the same shape — a mechanical,
 * language-independent, idempotent text fix applied directly in Crowdin (the
 * source of truth). Rather than copy a whole script per class, each class is a
 * small `NormalizationRule` ({ detect, fix }). New corruption = new rule, not a
 * new script or workflow step.
 *
 * Scan strategy is chosen automatically:
 *   - If every selected rule declares a `sourceFilter`, only the matching source
 *     strings are scanned (cheap per-string lookup) — used for the docs
 *     inline-code rule.
 *   - Otherwise every translation is paged per language (bulk) — needed for
 *     rules like escaped-unicode that can appear in any string.
 *
 * Usage:
 *   # Dry-run (read-only), all rules, default project 2 (docs)
 *   CROWDIN_PERSONAL_TOKEN=xxx npx tsx packages/twenty-utils/normalize-crowdin-translations.ts
 *
 *   # Apply, docs inline-code only (fast, targeted)
 *   CROWDIN_PERSONAL_TOKEN=xxx npx tsx packages/twenty-utils/normalize-crowdin-translations.ts \
 *     --project=2 --apply --rules=escaped-inline-code-tags
 *
 *   # Apply, app unicode fix (bulk)
 *   CROWDIN_PERSONAL_TOKEN=xxx npx tsx packages/twenty-utils/normalize-crowdin-translations.ts \
 *     --project=1 --apply --rules=escaped-unicode
 *
 * The token can be obtained from: https://twenty.crowdin.com/u/settings#api-key
 */

const CROWDIN_BASE_URL = 'https://twenty.api.crowdin.com/api/v2';

const PROJECT_ARG = process.argv.find((arg: string) =>
  arg.startsWith('--project='),
);
const CROWDIN_PROJECT_ID = PROJECT_ARG ? Number(PROJECT_ARG.split('=')[1]) : 2;
const APPLY = process.argv.includes('--apply');
const RULES_ARG = process.argv.find((arg: string) => arg.startsWith('--rules='));
const SELECTED_RULE_NAMES = RULES_ARG
  ? RULES_ARG.split('=')[1]
      .split(',')
      .map((name: string) => name.trim())
      .filter(Boolean)
  : null;

// How many string+language lookups to run in parallel (Crowdin rate limits are generous).
const FETCH_CONCURRENCY = 10;

type NormalizationRule = {
  name: string;
  detect: (text: string) => boolean;
  fix: (text: string) => string;
  // When present, only source strings matching this predicate are scanned,
  // which lets the engine use the cheap targeted lookup instead of a full scan.
  sourceFilter?: (sourceText: string) => boolean;
};

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
// Literal \uXXXX sequences that leaked into a translation instead of the character
const ESCAPED_UNICODE_REGEX = /\\u[0-9a-fA-F]{4}/;

const RULES: NormalizationRule[] = [
  {
    name: 'escaped-unicode',
    detect: (text) => ESCAPED_UNICODE_REGEX.test(text),
    fix: (text) =>
      text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        try {
          return String.fromCharCode(parseInt(hex, 16));
        } catch {
          return match;
        }
      }),
  },
  {
    name: 'escaped-inline-code-tags',
    detect: (text) => ESCAPED_TAG_REGEX.test(text),
    fix: (text) =>
      text
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#0*60;/g, '<')
        .replace(/&#0*62;/g, '>'),
    sourceFilter: inlineCodeHasTag,
  },
];

type CrowdinTranslation = {
  stringId: number;
  translationId: number;
  text: string;
};

type NormalizationFinding = {
  languageId: string;
  stringId: number;
  translationId: number;
  sourceText: string;
  originalText: string;
  fixedText: string;
  ruleNames: string[];
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

async function getSourceStrings(token: string): Promise<Map<number, string>> {
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

      result.set(item.data.id, text);
    }

    if (response.data.length < limit) break;
    offset += limit;
  }

  return result;
}

// Targeted lookup: translations for a single string+language. This endpoint
// returns the translation id as `id` and does not echo the stringId back.
async function getTranslationsForString(
  token: string,
  stringId: number,
  languageId: string,
): Promise<CrowdinTranslation[]> {
  type TranslationsResponse = {
    data: Array<{ data: { id: number; text: string } }>;
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

// Bulk lookup: every translation for a language, paged. This endpoint returns
// both stringId and translationId.
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
        data: { stringId: number; translationId: number; text: string };
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
): Promise<void> {
  await crowdinRequest(
    `/projects/${CROWDIN_PROJECT_ID}/translations/${translationId}`,
    token,
    { method: 'DELETE' },
  );
}

async function addTranslation(
  token: string,
  stringId: number,
  languageId: string,
  text: string,
): Promise<void> {
  const url = `${CROWDIN_BASE_URL}/projects/${CROWDIN_PROJECT_ID}/translations`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stringId, languageId, text }),
  });

  if (response.ok) return;

  const data = (await response.json()) as {
    errors?: Array<{ error?: { errors?: Array<{ message?: string }> } }>;
  };
  const errorMsg = data?.errors?.[0]?.error?.errors?.[0]?.message || '';

  // An identical translation already existing means the corrected version is
  // now the active one after we deleted the corrupted record — treat as success.
  if (errorMsg.includes('identical')) return;

  throw new Error(`Failed to add translation: ${JSON.stringify(data)}`);
}

// Applies every rule whose source string qualifies and whose pattern is present.
function evaluate(
  rules: NormalizationRule[],
  sourceText: string | undefined,
  translationText: string,
): { fixedText: string; ruleNames: string[] } {
  let fixedText = translationText;
  const ruleNames: string[] = [];

  for (const rule of rules) {
    if (
      rule.sourceFilter &&
      (sourceText === undefined || !rule.sourceFilter(sourceText))
    ) {
      continue;
    }

    if (rule.detect(fixedText)) {
      fixedText = rule.fix(fixedText);
      ruleNames.push(rule.name);
    }
  }

  return { fixedText, ruleNames };
}

async function scanTargeted(
  token: string,
  rules: NormalizationRule[],
  sourceStrings: Map<number, string>,
): Promise<NormalizationFinding[]> {
  const candidateIds = [...sourceStrings.entries()].filter(([, sourceText]) =>
    rules.some((rule) => rule.sourceFilter?.(sourceText)),
  );

  console.log(`  ${candidateIds.length} source strings match a rule filter`);

  const languages = await getProjectLanguages(token);
  console.log(`Languages: ${languages.length}`);

  const lookups: Array<{ stringId: number; languageId: string }> = [];

  for (const [stringId] of candidateIds) {
    for (const languageId of languages) {
      lookups.push({ stringId, languageId });
    }
  }

  console.log(`Scanning ${lookups.length} string/language pairs...`);

  const perLookup = await mapWithConcurrency(
    lookups,
    FETCH_CONCURRENCY,
    async ({ stringId, languageId }) => {
      const translations = await getTranslationsForString(
        token,
        stringId,
        languageId,
      );
      const sourceText = sourceStrings.get(stringId);
      const findings: NormalizationFinding[] = [];

      for (const translation of translations) {
        const { fixedText, ruleNames } = evaluate(
          rules,
          sourceText,
          translation.text,
        );

        if (ruleNames.length > 0) {
          findings.push({
            languageId,
            stringId: translation.stringId,
            translationId: translation.translationId,
            sourceText: sourceText ?? '',
            originalText: translation.text,
            fixedText,
            ruleNames,
          });
        }
      }

      return findings;
    },
  );

  return perLookup.flat();
}

async function scanBulk(
  token: string,
  rules: NormalizationRule[],
  sourceStrings: Map<number, string> | null,
): Promise<NormalizationFinding[]> {
  const languages = await getProjectLanguages(token);
  console.log(`Languages: ${languages.length}`);

  const findings: NormalizationFinding[] = [];

  for (const languageId of languages) {
    process.stdout.write(`Checking ${languageId}...`);
    const translations = await getTranslationsForLanguage(token, languageId);
    let found = 0;

    for (const translation of translations) {
      const sourceText = sourceStrings?.get(translation.stringId);
      const { fixedText, ruleNames } = evaluate(
        rules,
        sourceText,
        translation.text,
      );

      if (ruleNames.length > 0) {
        findings.push({
          languageId,
          stringId: translation.stringId,
          translationId: translation.translationId,
          sourceText: sourceText ?? '',
          originalText: translation.text,
          fixedText,
          ruleNames,
        });
        found++;
      }
    }

    console.log(` ${translations.length} translations, ${found} to fix`);
  }

  return findings;
}

async function main() {
  const token = await getToken();

  const selectedRules = SELECTED_RULE_NAMES
    ? RULES.filter((rule) => SELECTED_RULE_NAMES.includes(rule.name))
    : RULES;

  if (selectedRules.length === 0) {
    console.error(
      `No rules selected. Available: ${RULES.map((rule) => rule.name).join(', ')}`,
    );
    process.exit(1);
  }

  console.log(
    `Project ${CROWDIN_PROJECT_ID} — normalize translations (${APPLY ? 'APPLY' : 'DRY-RUN'})`,
  );
  console.log(`Rules: ${selectedRules.map((rule) => rule.name).join(', ')}`);

  const canTarget = selectedRules.every((rule) => rule.sourceFilter);
  const needsSource = selectedRules.some((rule) => rule.sourceFilter);

  let findings: NormalizationFinding[];

  if (canTarget) {
    console.log('Strategy: targeted (source-filtered lookup)');
    const sourceStrings = await getSourceStrings(token);
    findings = await scanTargeted(token, selectedRules, sourceStrings);
  } else {
    console.log('Strategy: bulk (full per-language scan)');
    const sourceStrings = needsSource ? await getSourceStrings(token) : null;
    findings = await scanBulk(token, selectedRules, sourceStrings);
  }

  console.log(`\n=== Found ${findings.length} corrupted translation(s) ===`);

  for (const finding of findings.slice(0, 15)) {
    console.log(
      `\n[${finding.languageId}] string ${finding.stringId} (${finding.ruleNames.join(', ')})`,
    );
    if (finding.sourceText) console.log(`  source: ${finding.sourceText}`);
    console.log(`  trans:  ${finding.originalText}`);
    console.log(`  fixed:  ${finding.fixedText}`);
  }

  if (findings.length === 0) {
    console.log('Nothing to normalize.');
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
