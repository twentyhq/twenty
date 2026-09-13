import { type NormalizationRule } from '../types/normalization-rule.type';

const ARGUMENT_NAME_REGEX = /^\{\s*([A-Za-z0-9_]+)\s*[,}]/;

// Arguments the message itself takes, ignoring plural and select case bodies:
// a translation may add cases its locale needs, but never a new argument, which
// the caller has no value for.
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
  return text.replace(
    new RegExp(`\\{\\s*${from}\\s*(?=[,}])`, 'g'),
    `{${to}`,
  );
}

function hasInventedArgument(text: string, sourceText?: string): boolean {
  return (
    sourceText !== undefined && inventedArgumentNames(text, sourceText).length > 0
  );
}

function repairInventedArgument(text: string, sourceText?: string): string {
  const source = sourceText ?? '';
  const sourceNames = [...topLevelArgumentNames(source)];

  const repairedText = inventedArgumentNames(text, source).reduce(
    (accumulator, inventedName) => {
      // Only a difference in spelling can be repaired: the argument is the same
      // one, so restoring the source's casing makes it resolve again.
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

  // An argument the source never had has no value to render, so an unrepaired
  // translation is dropped rather than shipped with a dangling placeholder.
  return inventedArgumentNames(repairedText, source).length > 0
    ? ''
    : repairedText;
}

export const INVENTED_ARGUMENT_RULE: NormalizationRule = {
  name: 'invented-argument',
  needsSourceText: true,
  detect: hasInventedArgument,
  fix: repairInventedArgument,
};
