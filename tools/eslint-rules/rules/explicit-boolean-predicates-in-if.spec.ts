import { TSESLint } from '@typescript-eslint/experimental-utils';

import rule, { RULE_NAME } from '../rules/explicit-boolean-predicates-in-if';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    project: 'packages/twenty-front/tsconfig.*?.json',
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'if (isValid) { console.log("Valid condition"); }',
    },
    {
      code: 'if (isValid && isEnabled) { console.log("Valid condition"); }',
    },
  ],
  invalid: [
    {
      code: 'if (someValue) { console.log("Invalid condition"); }',
      output:
        'if (isNonNullable(someValue)) { console.log("Invalid condition"); }',
      errors: [
        {
          messageId: 'nonExplicitPredicate',
          data: {
            actualText: 'someValue',
            expectedText: 'isNonNullable(someValue)',
          },
        },
      ],
    },
  ],
});
