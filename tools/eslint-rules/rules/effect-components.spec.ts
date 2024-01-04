import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from '../rules/effect-components';

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
      code: `const TestComponentEffect = () => <></>;`,
    },
    {
      code: `const TestComponent = () => <div></div>;`,
    },
    {
      code: `export const useUpdateEffect = () => null;`,
    },
    {
      code: `export const useUpdateEffect = () => <></>;`,
    },
    {
      code: `const TestComponent = () => <><div></div></>;`,
    },
    {
      code: `const TestComponentEffect = () => null;`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);

        return null; 
      }`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return <></>; 
      }`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return <></>; 
      }`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return null; 
      }`,
    },
  ],
  invalid: [
    {
      code: 'const TestComponent = () => <></>;',
      output: 'const TestComponentEffect = () => <></>;',
      errors: [
        {
          messageId: 'addEffectSuffix',
        },
      ],
    },
    {
      code: 'const TestComponentEffect = () => <><div></div></>;',
      output: 'const TestComponent = () => <><div></div></>;',
      errors: [
        {
          messageId: 'removeEffectSuffix',
        },
      ],
    },
  ],
});
