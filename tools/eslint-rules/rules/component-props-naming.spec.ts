import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './component-props-naming';

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
      code: 'export const MyComponent= (props: MyComponentProps) => <div>{props.message}</div>;',
    },
    {
      code: 'export const MyComponent = ({ message }: MyComponentProps) => <div>{message}</div>;',
    },
  ],
  invalid: [
    {
      code: 'export const MyComponent = (props: OwnProps) => <div>{props.message}</div>;',
      errors: [
        {
          messageId: 'invalidPropsTypeName',
        },
      ],
      output:
        'export const MyComponent = (props: MyComponentProps) => <div>{props.message}</div>;',
    },
    {
      code: 'export const MyComponent = ({ message }: OwnProps) => <div>{message}</div>;',
      errors: [
        {
          messageId: 'invalidPropsTypeName',
        },
      ],
      output:
        'export const MyComponent = ({ message }: MyComponentProps) => <div>{message}</div>;',
    },
  ],
});
