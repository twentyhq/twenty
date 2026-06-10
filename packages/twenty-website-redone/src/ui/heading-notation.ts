export type HeadingSegment =
  | { kind: 'text'; text: string }
  | { kind: 'accent'; text: string }
  | { kind: 'break' };

// Headings are authored as one translatable string: *span* switches to the
// accent family, \n breaks the line. Translators and machine translation see
// near-natural text instead of placeholder tags.
export function parseHeadingNotation(input: string): HeadingSegment[] {
  const segments: HeadingSegment[] = [];

  input.split('\n').forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      segments.push({ kind: 'break' });
    }

    line.split('*').forEach((part, partIndex) => {
      if (part === '') {
        return;
      }
      segments.push({
        kind: partIndex % 2 === 1 ? 'accent' : 'text',
        text: part,
      });
    });
  });

  return segments;
}
