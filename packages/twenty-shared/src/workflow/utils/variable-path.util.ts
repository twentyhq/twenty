// Characters that require bracket escaping in variable paths
// Spaces, dots, and brackets would break the dot-notation parsing
const SPECIAL_CHARS_REGEX = /[\s.[]/;

export const needsEscaping = (key: string): boolean =>
  SPECIAL_CHARS_REGEX.test(key);

export const escapePathSegment = (segment: string): string =>
  needsEscaping(segment) ? `[${segment}]` : segment;

export const joinVariablePath = (segments: string[]): string =>
  segments.map(escapePathSegment).join('.');

/**
 * Parses a variable path string into segments, handling bracket notation.
 * Examples:
 *   "step.normal.key" => ["step", "normal", "key"]
 *   "step.[key with space].value" => ["step", "key with space", "value"]
 *   "step.[key.with.dots]" => ["step", "key.with.dots"]
 */
export const parseVariablePath = (path: string): string[] => {
  const segments: string[] = [];
  let current = '';
  let inBracket = false;
  let segmentIndex = 0;

  while (segmentIndex < path.length) {
    const char = path[segmentIndex];

    if (char === '[' && !inBracket) {
      if (current.length > 0) {
        segments.push(current);
        current = '';
      }
      inBracket = true;
      segmentIndex++;
      continue;
    }

    if (char === ']' && inBracket) {
      segments.push(current);
      current = '';
      inBracket = false;
      segmentIndex++;
      // Skip the following dot if present
      if (segmentIndex < path.length && path[segmentIndex] === '.') {
        segmentIndex++;
      }
      continue;
    }

    if (char === '.' && !inBracket) {
      if (current.length > 0) {
        segments.push(current);
        current = '';
      }
      segmentIndex++;
      continue;
    }

    current += char;
    segmentIndex++;
  }

  if (current.length > 0) {
    segments.push(current);
  }

  return segments;
};
