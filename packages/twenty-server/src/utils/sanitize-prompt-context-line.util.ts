import { isNonEmptyString } from '@sniptt/guards';

// NUL bytes break Postgres text inserts, and line breaks in single-line fields could forge
// extra lines inside the model-facing context message built from these values.
const CONTROL_CHARACTERS_AND_LINE_BREAKS_PATTERN =
  /[\u0000-\u001f\u007f\u0080-\u009f]+/g;

export const sanitizePromptContextLine = (
  value: unknown,
  maxLength: number,
): string | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const cleanedValue = value
    .replace(CONTROL_CHARACTERS_AND_LINE_BREAKS_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return isNonEmptyString(cleanedValue)
    ? cleanedValue.slice(0, maxLength)
    : null;
};
