/**
 * Normalizes Crowdin translations that were mechanically corrupted during the
 * translation step (MT / AI / human), so Crowdin's builder can always rebuild
 * valid output and downstream builds (Mintlify, Lingui) don't go stale.
 *
 * Every corruption class we have hit is the same shape - a mechanical,
 * language-independent, idempotent text fix applied directly in Crowdin (the
 * source of truth). Each class is therefore a small `NormalizationRule` in
 * crowdin-normalization-rules.ts rather than a script of its own.
 *
 * Scan strategy is chosen automatically:
 *   - If every selected rule declares a `sourceFilter`, only the matching source
 *     strings are scanned (targeted) - used for the docs inline-code rule.
 *   - Otherwise every translation is paged per language (bulk) - needed for
 *     rules like escaped-unicode that can appear in any string.
 *
 * Usage:
 *   # Dry-run (read-only), all rules, default project 2 (docs)
 *   CROWDIN_PERSONAL_TOKEN=xxx npx tsx packages/twenty-utils/normalize-crowdin-translations.ts
 *
 *   # Apply, docs inline-code only (targeted)
 *   CROWDIN_PERSONAL_TOKEN=xxx npx tsx packages/twenty-utils/normalize-crowdin-translations.ts \
 *     --project=2 --apply --rules=escaped-inline-code-tags
 *
 *   # Apply, app unicode fix (bulk)
 *   CROWDIN_PERSONAL_TOKEN=xxx npx tsx packages/twenty-utils/normalize-crowdin-translations.ts \
 *     --project=1 --apply --rules=escaped-unicode
 */

import {
  addTranslation,
  deleteTranslation,
  fetchLanguageTranslations,
  fetchSourceStringsById,
  fetchTargetLanguageIds,
  getCrowdinTokenOrThrow,
  type CrowdinContext,
  type CrowdinTranslation,
} from './crowdin-api';
import {
  evaluateRules,
  NORMALIZATION_RULES,
  type NormalizationRule,
} from './crowdin-normalization-rules';
import { mapWithConcurrency } from './map-with-concurrency.util';

const DEFAULT_PROJECT_ID = 2;
// How many per-language lookups to run in parallel (Crowdin rate limits are generous).
const FETCH_CONCURRENCY = 10;
const MAX_PREVIEWED_FINDINGS = 15;

type NormalizationFinding = {
  languageId: string;
  stringId: number;
  translationId: number;
  sourceText: string;
  originalText: string;
  fixedText: string;
  ruleNames: string[];
};

function getArgumentValue(name: string): string | undefined {
  return process.argv
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.split('=')[1];
}

function parseProjectIdOrThrow(): number {
  const rawProjectId = getArgumentValue('project');

  if (rawProjectId === undefined) return DEFAULT_PROJECT_ID;

  const projectId = Number(rawProjectId);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new Error(`Invalid --project=${rawProjectId}, expected a project id`);
  }

  return projectId;
}

function selectRulesOrThrow(): NormalizationRule[] {
  const rawRules = getArgumentValue('rules');

  if (rawRules === undefined) return NORMALIZATION_RULES;

  const requestedNames = rawRules
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  const availableNames = NORMALIZATION_RULES.map((rule) => rule.name);
  const unknownNames = requestedNames.filter(
    (name) => !availableNames.includes(name),
  );

  if (requestedNames.length === 0 || unknownNames.length > 0) {
    throw new Error(
      `Unknown rule(s): ${unknownNames.join(', ') || '(none given)'}. Available: ${availableNames.join(', ')}`,
    );
  }

  return NORMALIZATION_RULES.filter((rule) =>
    requestedNames.includes(rule.name),
  );
}

function collectFindings({
  rules,
  sourceStrings,
  languageId,
  translations,
}: {
  rules: NormalizationRule[];
  sourceStrings: Map<number, string> | null;
  languageId: string;
  translations: CrowdinTranslation[];
}): NormalizationFinding[] {
  return translations.flatMap((translation) => {
    const sourceText = sourceStrings?.get(translation.stringId);
    const { fixedText, ruleNames } = evaluateRules({
      rules,
      sourceText,
      translationText: translation.text,
    });

    if (ruleNames.length === 0) return [];

    return [
      {
        languageId,
        stringId: translation.stringId,
        translationId: translation.translationId,
        sourceText: sourceText ?? '',
        originalText: translation.text,
        fixedText,
        ruleNames,
      },
    ];
  });
}

async function scan({
  context,
  rules,
  sourceStrings,
}: {
  context: CrowdinContext;
  rules: NormalizationRule[];
  sourceStrings: Map<number, string> | null;
}): Promise<NormalizationFinding[]> {
  const candidateStringIds = sourceStrings
    ? [...sourceStrings.entries()]
        .filter(([, sourceText]) =>
          rules.some((rule) => rule.sourceFilter?.(sourceText)),
        )
        .map(([stringId]) => stringId)
    : [];

  const isTargeted = rules.every((rule) => rule.sourceFilter);

  if (isTargeted) {
    console.log(
      `Strategy: targeted - ${candidateStringIds.length} source strings match a rule filter`,
    );
  } else {
    console.log('Strategy: bulk - every translation of every language');
  }

  const languageIds = await fetchTargetLanguageIds(context);

  console.log(`Languages: ${languageIds.length}`);

  const perLanguage = await mapWithConcurrency({
    items: languageIds,
    limit: FETCH_CONCURRENCY,
    handler: async (languageId) => {
      const translations = await fetchLanguageTranslations(context, {
        languageId,
        stringIds: isTargeted ? candidateStringIds : undefined,
      });

      const findings = collectFindings({
        rules,
        sourceStrings,
        languageId,
        translations,
      });

      console.log(
        `  ${languageId}: ${translations.length} translations, ${findings.length} to fix`,
      );

      return findings;
    },
  });

  return perLanguage.flat();
}

async function repair(
  context: CrowdinContext,
  findings: NormalizationFinding[],
): Promise<number> {
  let failed = 0;

  for (const finding of findings) {
    try {
      // Add before delete: the newly added translation becomes the exported one,
      // so a failed re-add can never leave the string without a translation.
      await addTranslation(context, {
        stringId: finding.stringId,
        languageId: finding.languageId,
        text: finding.fixedText,
      });
      await deleteTranslation(context, {
        translationId: finding.translationId,
      });
    } catch (error) {
      failed++;
      console.error(
        `  Failed to repair string ${finding.stringId} (${finding.languageId}): ${error}`,
      );
    }
  }

  return failed;
}

async function main() {
  const context: CrowdinContext = {
    token: getCrowdinTokenOrThrow(),
    projectId: parseProjectIdOrThrow(),
  };
  const rules = selectRulesOrThrow();
  const isApply = process.argv.includes('--apply');

  console.log(
    `Project ${context.projectId} - normalize translations (${isApply ? 'APPLY' : 'DRY-RUN'})`,
  );
  console.log(`Rules: ${rules.map((rule) => rule.name).join(', ')}`);

  const needsSourceStrings = rules.some((rule) => rule.sourceFilter);
  const sourceStrings = needsSourceStrings
    ? await fetchSourceStringsById(context)
    : null;

  const findings = await scan({ context, rules, sourceStrings });

  console.log(`\n=== Found ${findings.length} corrupted translation(s) ===`);

  for (const finding of findings.slice(0, MAX_PREVIEWED_FINDINGS)) {
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

  if (!isApply) {
    console.log('\nDry-run only. Re-run with --apply to repair.');

    return;
  }

  console.log('\n=== Applying repairs ===');

  const failed = await repair(context, findings);

  console.log(
    `Repaired ${findings.length - failed} translation(s) in Crowdin.`,
  );

  // Surface failures loudly: a silent partial run leaves a language unbuildable
  // and every one of its pages stale until someone notices.
  if (failed > 0) {
    throw new Error(`${failed} translation(s) could not be normalized`);
  }
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
