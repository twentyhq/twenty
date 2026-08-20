import { NORMALIZATION_RULES } from './constants/normalization-rules.constant';
import { type CrowdinContext } from './types/crowdin-context.type';
import { type CrowdinTranslation } from './types/crowdin-translation.type';
import { type NormalizationRule } from './types/normalization-rule.type';
import { addTranslation } from './utils/add-translation.util';
import { deleteTranslation } from './utils/delete-translation.util';
import { evaluateRules } from './utils/evaluate-rules.util';
import { fetchLanguageTranslations } from './utils/fetch-language-translations.util';
import { fetchSourceStringsById } from './utils/fetch-source-strings-by-id.util';
import { fetchTargetLanguageIds } from './utils/fetch-target-language-ids.util';
import { getCrowdinTokenOrThrow } from './utils/get-crowdin-token-or-throw.util';
import { mapWithConcurrency } from './utils/map-with-concurrency.util';

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
  const projectId = Number(rawProjectId);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new Error(
      `Missing or invalid --project=${rawProjectId ?? ''}, expected a project id`,
    );
  }

  return projectId;
}

function selectRulesOrThrow(): NormalizationRule[] {
  const requestedNames = (getArgumentValue('rules') ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  const availableNames = NORMALIZATION_RULES.map((rule) => rule.name);
  const unknownNames = requestedNames.filter(
    (name) => !availableNames.includes(name),
  );

  if (requestedNames.length === 0 || unknownNames.length > 0) {
    throw new Error(
      `Missing or unknown --rules=${unknownNames.join(',')}. Available: ${availableNames.join(', ')}`,
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
  sourceStrings: Map<number, string> | undefined;
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
  sourceStrings: Map<number, string> | undefined;
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

async function repairOne(
  context: CrowdinContext,
  finding: NormalizationFinding,
): Promise<boolean> {
  try {
    await addTranslation(context, {
      stringId: finding.stringId,
      languageId: finding.languageId,
      text: finding.fixedText,
    });
    await deleteTranslation(context, { translationId: finding.translationId });

    return true;
  } catch (error) {
    console.error(
      `  Failed to repair string ${finding.stringId} (${finding.languageId}): ${error}`,
    );

    return false;
  }
}

async function repair(
  context: CrowdinContext,
  findings: NormalizationFinding[],
): Promise<number> {
  const outcomes: boolean[] = [];

  for (const finding of findings) {
    outcomes.push(await repairOne(context, finding));
  }

  return outcomes.filter((isRepaired) => !isRepaired).length;
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
    : undefined;

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

  if (failed > 0) {
    throw new Error(`${failed} translation(s) could not be normalized`);
  }
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
