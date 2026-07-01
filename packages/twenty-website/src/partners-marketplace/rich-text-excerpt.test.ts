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
