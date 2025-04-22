import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-no-hardcoded-colors"
export const RULE_NAME = 'no-hardcoded-colors';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    docs: {
      description:
        'Do not use hardcoded RGBA or Hex colors. Please use a color from the theme file.',
    },
    messages: {
      hardcodedColor:
        'Hardcoded color {{ color }} found. Please use a color from the theme file.',
    },
    type: 'suggestion',
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create: (context) => {
    const testHardcodedColor = (
      literal: TSESTree.Literal | TSESTree.TemplateLiteral
    ) => {
      const colorRegex = /(?:rgba?\()|(?:#[0-9a-fA-F]{3,6})\b/i;

      if (
        literal.type === TSESTree.AST_NODE_TYPES.Literal &&
        typeof literal.value === 'string'
      ) {
        if (colorRegex.test(literal.value)) {
          context.report({
            node: literal,
            messageId: 'hardcodedColor',
            data: {
              color: literal.value,
            },
          });
        }
      } else if (literal.type === TSESTree.AST_NODE_TYPES.TemplateLiteral) {
        for (const quasi of literal.quasis) {
          const firstStringValue = quasi.value.raw;

        if (colorRegex.test(firstStringValue)) {
          context.report({
            node: literal,
            messageId: 'hardcodedColor',
            data: {
                color: firstStringValue,
              },
            });
          }
        }
      }
    };

    return {
      Literal: (literal: TSESTree.Literal) => testHardcodedColor(literal),
      TemplateLiteral: (templateLiteral: TSESTree.TemplateLiteral) =>
        testHardcodedColor(templateLiteral),
    };
  },
});
