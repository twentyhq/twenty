import { Decorator } from '@storybook/react';

import { GRAY_SCALE, MAIN_COLORS } from '@ui/theme';

import { ComponentStorybookLayout } from '../ComponentStorybookLayout';

const getBackgroundColor = (inverted: boolean, accent: string) => {
  if (!inverted) return undefined;

  switch (accent) {
    case 'default':
      return GRAY_SCALE.gray50;
    case 'danger':
      return MAIN_COLORS.red;
    case 'blue':
      return MAIN_COLORS.blue;
    default:
      return undefined;
  }
};

export const ComponentDecorator: Decorator = (Story, context) => {
  const { container } = context.parameters;
  const inverted = context.args.inverted as boolean;
  const accent = context.args.accent as string;
  const backgroundColor = getBackgroundColor(inverted, accent);

  return (
    <ComponentStorybookLayout
      width={container?.width}
      height={container?.height}
      backgroundColor={backgroundColor}
    >
      <Story />
    </ComponentStorybookLayout>
  );
};
