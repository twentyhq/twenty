export type HeadingSegment =
  | { kind: 'text'; text: string }
  | { kind: 'accent'; text: string };

// Headings are authored as one translatable string: *span* switches to the
// accent family. There is deliberately no line-break notation — wrapping is
// emergent (text-wrap: balance + the layout's measure), never authored, so
// no breakpoint can inherit a break that only made sense at another width.
// Whitespace, including newlines, normalizes to single spaces.
export function parseHeadingNotation(input: string): HeadingSegment[] {
  const segments: HeadingSegment[] = [];

  input
    .replace(/\s+/g, ' ')
    .split('*')
    .forEach((part, partIndex) => {
      if (part === '') {
        return;
      }
      segments.push({
        kind: partIndex % 2 === 1 ? 'accent' : 'text',
        text: part,
      });
    });

  return segments;
}
