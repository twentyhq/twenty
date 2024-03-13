import { Decorator } from '@storybook/react';

import { ComponentStorybookLayout } from '../ComponentStorybookLayout';

export const ComponentDecorator: Decorator = (Story, context) => {
  const { container } = context.parameters;

  return (
    <ComponentStorybookLayout width={container?.width}>
      <Story />
    </ComponentStorybookLayout>
  );
};
