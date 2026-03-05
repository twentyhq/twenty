import { type Decorator } from '@storybook/react-vite';

import { themeCssVariables } from '@ui/theme-constants';

import { ComponentStorybookLayout } from '../ComponentStorybookLayout';

const getBackgroundColor = (inverted: boolean, accent: string) => {
  if (!inverted) return undefined;

  switch (accent) {
    case 'default':
      return themeCssVariables.grayScale.gray11;
    case 'danger':
      return themeCssVariables.color.red;
    case 'blue':
      return themeCssVariables.color.blue;
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
