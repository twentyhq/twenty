import { A11Y_DEFER_COLOR_CONTRAST } from '@ui/testing';

export const PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS = {
  ...A11Y_DEFER_COLOR_CONTRAST,
  config: {
    rules: [
      ...A11Y_DEFER_COLOR_CONTRAST.config.rules,
      {
        id: 'aria-hidden-focus',
        selector: '[aria-hidden="true"]:not([data-base-ui-focus-guard])',
      },
    ],
  },
};
