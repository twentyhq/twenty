import { type NormalizationRule } from '../types/normalization-rule.type';

// Trailing characters the machine translator leaves behind once its response
// envelope bleeds into the string. Only stripped when the source does not end
// the same way, so legitimate quotes and brackets survive.
const DEBRIS_CHARACTERS = new Set([
  ' ',
  '\t',
  '\n',
  '\r',
  ' ',
  '`',
  ']',
  "'",
  '"',
]);

// Fragments of the translator's own JSON/markdown envelope. A salvaged prefix
// carrying one of these was cut inside the envelope rather than after it.
const ENVELOPE_REGEX = /pluralForm|```|\\",\\"|\[/;

const ICU_ARGUMENT_REGEX = /\{\s*([A-Za-z0-9_]+)\s*[,}]/g;
const ICU_TAG_REGEX = /<\/?\d+>/g;

function hasBalancedBraces(text: string): boolean {
  let depth = 0;

  for (const character of text) {
    if (character === '{') {
      depth += 1;
      continue;
    }

    if (character === '}') {
      depth -= 1;

      if (depth < 0) {
        return false;
      }
    }
  }

  return depth === 0;
}

// The first unmatched '}' is where the translation ends and the envelope begins.
function cutAtUnmatchedBrace(text: string): string | undefined {
  let depth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '{') {
      depth += 1;
      continue;
    }

    if (character === '}') {
      if (depth === 0) {
        return text.slice(0, index);
      }

      depth -= 1;
    }
  }

  return undefined;
}

function trimDebris(text: string, sourceText: string): string {
  let end = text.length;

  while (
    end > 0 &&
    DEBRIS_CHARACTERS.has(text[end - 1]) &&
    !sourceText.endsWith(text[end - 1])
  ) {
    end -= 1;
  }

  return text.slice(0, end);
}

function icuShape(text: string): string {
  const argumentNames = [...text.matchAll(ICU_ARGUMENT_REGEX)]
    .map(([, name]) => name)
    .sort();
  const tags = [...text.matchAll(ICU_TAG_REGEX)].map(([tag]) => tag).sort();

  return JSON.stringify([argumentNames, tags]);
}

function isCorrupted(text: string, sourceText?: string): boolean {
  return (
    sourceText !== undefined &&
    hasBalancedBraces(sourceText) &&
    !hasBalancedBraces(text)
  );
}

function salvage(text: string, sourceText?: string): string {
  const source = sourceText ?? '';
  const cutText = cutAtUnmatchedBrace(text);

  // Balanced text has nothing to cut. Otherwise an unclosed '{' is all that is
  // left, with no clean tail to cut after, so the translation is dropped rather
  // than guessed at.
  if (cutText === undefined) {
    return hasBalancedBraces(text) ? text : '';
  }

  const salvagedText = trimDebris(cutText, source);

  const isSalvageable =
    salvagedText !== '' &&
    hasBalancedBraces(salvagedText) &&
    (!ENVELOPE_REGEX.test(salvagedText) || ENVELOPE_REGEX.test(source)) &&
    icuShape(salvagedText) === icuShape(source);

  // An empty repair tells the runner to delete the translation rather than
  // replace it, so the locale falls back to English until Crowdin retranslates.
  return isSalvageable ? salvagedText : '';
}

export const CORRUPTED_MODEL_OUTPUT_RULE: NormalizationRule = {
  name: 'corrupted-model-output',
  needsSourceText: true,
  detect: isCorrupted,
  fix: salvage,
};
