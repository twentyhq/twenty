const LEADING_TITLE_PATTERN = /^\s*#\s[^\n]*\n+/;

export const stripLeadingMarkdownTitle = (markdown: string): string =>
  markdown.replace(LEADING_TITLE_PATTERN, '');
