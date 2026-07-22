import { richTextExcerpt } from './rich-text-excerpt';

test('strips markdown syntax to plain text', () => {
  expect(
    richTextExcerpt('**Bold** lead.\n\n#### Heading\n\n- item one\n- item two'),
  ).toBe('Bold lead. Heading item one item two');
});
test('truncates with an ellipsis', () => {
  const long = 'word '.repeat(60).trim();
  const out = richTextExcerpt(long, 50);
  expect(out.length).toBeLessThanOrEqual(51);
  expect(out.endsWith('…')).toBe(true);
});
test('preserves markdown-marker characters used inline, not as syntax', () => {
  expect(richTextExcerpt('We use C# and ship up-to-date tooling.')).toBe(
    'We use C# and ship up-to-date tooling.',
  );
});
test('strips a blockquote marker only at the start of a line', () => {
  expect(richTextExcerpt('> A quote\n\nRegular text > inline.')).toBe(
    'A quote Regular text > inline.',
  );
});
