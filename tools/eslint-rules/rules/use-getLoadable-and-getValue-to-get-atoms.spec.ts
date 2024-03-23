import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './use-getLoadable-and-getValue-to-get-atoms';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const atoms = snapshot.getLoadable(someState).getValue();',
    },
    {
      code: 'const atoms = snapshot.getLoadable(someState(viewId)).getValue();',
    },
  ],
  invalid: [
    {
      code: 'const atoms = await snapshot.getPromise(someState);',
      errors: [
        {
          messageId: 'invalidAccessorOnSnapshot',
        },
      ],
      output: 'const atoms = await snapshot.getLoadable(someState);',
    },
    {
      code: 'const atoms = await snapshot.getPromise(someState(viewId));',
      errors: [
        {
          messageId: 'invalidAccessorOnSnapshot',
        },
      ],
      output: 'const atoms = await snapshot.getLoadable(someState(viewId));',
    },
    {
      code: 'const atoms = snapshot.getLoadable(someState).anotherMethod();',
      errors: [
        {
          messageId: 'invalidWayToGetAtoms',
        },
      ],
      output: 'const atoms = snapshot.getLoadable(someState).getValue();',
    },
  ],
});
