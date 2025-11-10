import type { Rule } from 'eslint';

export const RULE_NAME = 'no-angle-bracket-placeholders';

const ALLOWED_TAGS = [
  'img',
  'div',
  'span',
  'p',
  'a',
  'b',
  'strong',
  'em',
  'i',
  'code',
  'pre',
  'br',
  'hr',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'input',
  'button',
  'summary',
  'details',
  // MDX/Documentation components
  'Frame',
  'Warning',
  'Tip',
  'Info',
  'Note',
  'Card',
  'Step',
  'Tab',
  'Tabs',
  'ArticleTab',
  'ArticleTabs',
  'Accordion',
  'AccordionGroup',
  'Router',
  'BrowserRouter',
  'RecoilRoot',
];

export const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow angle bracket placeholders in MDX files to prevent Crowdin translation errors. Use curly braces {placeholder} instead.',
      recommended: true,
    },
    messages: {
      noAngleBracketPlaceholder:
        'Avoid angle bracket placeholders like "<{{name}}>" in documentation. Use curly braces "{{{name}}}" instead to prevent Crowdin translation errors.',
    },
    schema: [],
    fixable: 'code',
  },

  create: (context) => {
    const sourceCode = context.sourceCode || context.getSourceCode();
    const filename = context.filename || context.getFilename();

    if (!filename.endsWith('.mdx')) {
      return {};
    }

    return {
      Program: (node) => {
        const text = sourceCode.getText();

        // check for URL patterns with angle brackets (e.g., https://<your-domain>/)
        const urlPlaceholderRegex = /(https?:\/\/)<([a-z][a-z0-9_-]+)>/g;
        let urlMatch;
        const foundPositions = new Set();

        while ((urlMatch = urlPlaceholderRegex.exec(text)) !== null) {
          const tagName = urlMatch[2];
          const startPos = urlMatch.index + urlMatch[1].length; // Start after http(s)://
          const endPos = startPos + tagName.length + 2; // +2 for < and >

          foundPositions.add(startPos);

          // Check if we're inside a code block (between backticks)
          const beforeText = text.substring(0, startPos);
          const backticksBefore = (beforeText.match(/`/g) || []).length;
          const insideCodeBlock = backticksBefore % 2 !== 0;

          context.report({
            node: node as any,
            loc: {
              start: sourceCode.getLocFromIndex(startPos),
              end: sourceCode.getLocFromIndex(endPos),
            },
            messageId: 'noAngleBracketPlaceholder',
            data: {
              name: tagName,
            },
            fix: insideCodeBlock
              ? (fixer) => {
                  return fixer.replaceTextRange(
                    [startPos, endPos],
                    `{${tagName}}`,
                  );
                }
              : undefined,
          });
        }

        const placeholderRegex = /<([a-z][a-z0-9_-]+)>/g;
        let match;

        while ((match = placeholderRegex.exec(text)) !== null) {
          const tagName = match[1];
          const startPos = match.index;

          if (foundPositions.has(startPos)) {
            continue;
          }

          if (ALLOWED_TAGS.includes(tagName)) {
            continue;
          }

          const beforeMatch = text.charAt(match.index - 1);
          if (beforeMatch === '/') {
            continue;
          }

          const endPos = startPos + match[0].length;

          // Check if we're inside a code block (between backticks)
          const beforeText = text.substring(0, match.index);
          const backticksBefore = (beforeText.match(/`/g) || []).length;
          const insideCodeBlock = backticksBefore % 2 !== 0;

          context.report({
            node: node as any,
            loc: {
              start: sourceCode.getLocFromIndex(startPos),
              end: sourceCode.getLocFromIndex(endPos),
            },
            messageId: 'noAngleBracketPlaceholder',
            data: {
              name: tagName,
            },
            fix: insideCodeBlock
              ? (fixer) => {
                  return fixer.replaceTextRange(
                    [startPos, endPos],
                    `{${tagName}}`,
                  );
                }
              : undefined,
          });
        }
      },
    };
  },
};

