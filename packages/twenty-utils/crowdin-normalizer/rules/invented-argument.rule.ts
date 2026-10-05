import { type NormalizationRule } from '../types/normalization-rule.type';

const ARGUMENT_NAME_REGEX = /^\{\s*([A-Za-z0-9_]+)\s*[,}]/;

// Ignores plural and select case bodies: a locale may add cases but never an argument the caller has no value for.
function topLevelArgumentNames(text: string): Set<string> {
  const names = new Set<string>();
  let depth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '{') {
      if (depth === 0) {
        const match = ARGUMENT_NAME_REGEX.exec(text.slice(index));

        if (match !== null) names.add(match[1]);
      }

      depth += 1;
      continue;
    }

    if (character === '}') depth -= 1;
  }

  return names;
}

function inventedArgumentNames(text: string, sourceText: string): string[] {
  const sourceNames = topLevelArgumentNames(sourceText);

  return [...topLevelArgumentNames(text)].filter(
    (name) => !sourceNames.has(name),
  );
}

function renameArgument(text: string, from: string, to: string): string {
  return text.replace(new RegExp(`\\{\\s*${from}\\s*(?=[,}])`, 'g'), `{${to}`);
}

function hasInventedArgument(text: string, sourceText?: string): boolean {
  return (
    sourceText !== undefined &&
    inventedArgumentNames(text, sourceText).length > 0
  );
}

function repairInventedArgument(text: string, sourceText?: string): string {
  const source = sourceText ?? '';
  const sourceNames = [...topLevelArgumentNames(source)];

  const repairedText = inventedArgumentNames(text, source).reduce(
    (accumulator, inventedName) => {
      // Only a casing difference is repairable: it is the same argument.
      const intendedName = sourceNames.find(
        (name) =>
          name.toLowerCase() === inventedName.toLowerCase() &&
          !topLevelArgumentNames(accumulator).has(name),
      );

      return intendedName === undefined
        ? accumulator
        : renameArgument(accumulator, inventedName, intendedName);
    },
    text,
  );

  // Dropped rather than shipped with a placeholder nothing can fill.
  return inventedArgumentNames(repairedText, source).length > 0
    ? ''
    : repairedText;
}

export const INVENTED_ARGUMENT_RULE: NormalizationRule = {
  name: 'invented-argument',
  formats: ['po'],
  needsSourceText: true,
  detect: hasInventedArgument,
  fix: repairInventedArgument,
};
