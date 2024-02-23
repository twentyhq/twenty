import { ESLintUtils } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-usage-getLoadable-and-getValue-to-get-atoms"
export const RULE_NAME = 'use-getLoadable-and-getValue-to-get-atoms';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure you are using getLoadable and getValue',
      recommended: 'recommended',
    },
    fixable: 'code',
    schema: [],
    messages: {
      invalidWayToGetAtoms:
        "Expected usage '{{ expectedWayToGetAtoms }}' but found '{{ actualWayToGetAtoms }}'",
    },
  },
  defaultOptions: [],
  create: (context) => ({
    AwaitExpression: (node) => {
      const { argument: arg }: any = node;
      if (
        arg.callee &&
        arg.callee.type === 'MemberExpression' &&
        arg.callee.object.name === 'snapshot' &&
        arg.callee.property.name === 'getPromise' &&
        arg.arguments &&
        arg.arguments[0]
      ) {
        let actualWayToGetAtoms: string;
        let expectedWayToGetAtoms: string;

        if (arg.arguments[0].callee) {
          const familyKey = arg.arguments[0].arguments[0].name;
          const familyName = arg.arguments[0].callee.name;
          actualWayToGetAtoms = `snapshot.getPromise(${familyName}(${familyKey}))`;
          expectedWayToGetAtoms = `snapshot.getLoadable(${familyName}(${familyKey})).getValue()`;
        } else {
          const recoilValue = arg.arguments[0].name;
          actualWayToGetAtoms = `snapshot.getPromise(${recoilValue})`;
          expectedWayToGetAtoms = `snapshot.getLoadable(${recoilValue}).getValue()`;
        }

        context.report({
          node,
          messageId: 'invalidWayToGetAtoms',
          data: {
            expectedWayToGetAtoms,
            actualWayToGetAtoms,
          },
          fix: (fixer) => fixer.replaceText(node, expectedWayToGetAtoms),
        });
      }
    },
  }),
});
