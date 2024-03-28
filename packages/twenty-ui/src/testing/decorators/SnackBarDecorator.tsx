import { Decorator } from '@storybook/react';

import { SnackBarProviderScope } from 'src/feedback';

export const SnackBarDecorator: Decorator = (Story) => (
  <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
    <Story />
  </SnackBarProviderScope>
);
