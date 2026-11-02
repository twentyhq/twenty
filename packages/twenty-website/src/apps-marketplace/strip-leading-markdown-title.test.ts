import { stripLeadingMarkdownTitle } from './strip-leading-markdown-title';

describe('stripLeadingMarkdownTitle', () => {
  it('drops a leading h1 and the blank lines after it', () => {
    expect(stripLeadingMarkdownTitle('# Slack\n\n**Tagline**\n\n## How')).toBe(
      '**Tagline**\n\n## How',
    );
  });

  it('drops a leading h1 preceded by whitespace', () => {
    expect(stripLeadingMarkdownTitle('\n\n  # Slack\nBody')).toBe('Body');
  });

  it.each([
    '## Getting started\n\nBody',
    'Body first\n\n# Not a title',
    '#hashtag without a space',
    '',
  ])('leaves %j unchanged', (markdown) => {
    expect(stripLeadingMarkdownTitle(markdown)).toBe(markdown);
  });
});
