import { type Parameters } from '@storybook/react-vite';

export const DROPDOWN_STORY_A11Y_PARAMETERS = {
  config: {
    rules: [
      {
        id: 'aria-hidden-focus',
        selector: '[aria-hidden="true"]:not([data-base-ui-focus-guard])',
      },
    ],
  },
} satisfies Parameters['a11y'];
