import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './no-hardcoded-colors';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const color = theme.background.secondary;',
    },
  ],
  invalid: [
    {
      code: 'const color = "rgb(154,205,50)";',
      errors: [
        {
          messageId: 'hardcodedColor',
        },
      ],
    },
    {
      code: 'const color = { test: "rgb(154,205,50)", test2: "#ADFF2F" }',
      errors: [
        {
          messageId: 'hardcodedColor',
        },
        {
          messageId: 'hardcodedColor',
        },
      ],
    },
    {
      code: 'const color = { test: `rgb(${r},${g},${b})`, test2: `#ADFF${test}` }',
      errors: [
        {
          messageId: 'hardcodedColor',
        },
        {
          messageId: 'hardcodedColor',
        },
      ],
    },
    {
      code: 'const color = "#ADFF2F";',
      errors: [
        {
          messageId: 'hardcodedColor',
        },
      ],
    },
  ],
});
