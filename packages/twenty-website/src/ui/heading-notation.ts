export type HeadingSegment =
  | { kind: 'text'; text: string }
  | { kind: 'accent'; text: string }
  | { kind: 'break' };

// Headings are authored as one translatable string: *span* switches to the
// accent family. Wrapping stays emergent (text-wrap: balance + the layout's
// measure) — there is no JSX <br> — but a newline IN THE MESSAGE is an
// authored stack the locale owns (the pricing hero's "Simple / Pricing"):
// translators drop or move it per language, so no breakpoint or locale can
// inherit a break that only made sense elsewhere. All other whitespace
// normalizes to single spaces.
export function parseHeadingNotation(input: string): HeadingSegment[] {
  const segments: HeadingSegment[] = [];

  input.split(/\s*\n\s*/).forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      segments.push({ kind: 'break' });
    }
    line
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
  });

  return segments;
}
