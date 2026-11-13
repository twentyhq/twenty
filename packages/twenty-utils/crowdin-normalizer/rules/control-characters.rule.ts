import { type NormalizationRule } from '../types/normalization-rule.type';

const ALLOWED_CONTROL_CHARACTERS = new Set(['\t', '\n', '\r']);

function isControlCharacter(character: string): boolean {
  const codePoint = character.codePointAt(0) ?? 0;

  return (
    (codePoint < 0x20 || codePoint === 0x7f) &&
    !ALLOWED_CONTROL_CHARACTERS.has(character)
  );
}

function controlCharactersIn(text: string): string[] {
  return [...text].filter(isControlCharacter);
}

// Mis-decoded escapes leave no consistent pattern to repair, so the translation is dropped.
function hasInventedControlCharacter(
  text: string,
  sourceText?: string,
): boolean {
  if (sourceText === undefined) return false;

  return controlCharactersIn(text).some(
    (character) => !sourceText.includes(character),
  );
}

function dropTranslation(): string {
  return '';
}

export const CONTROL_CHARACTERS_RULE: NormalizationRule = {
  name: 'control-characters',
  formats: ['po'],
  needsSourceText: true,
  detect: hasInventedControlCharacter,
  fix: dropTranslation,
};
