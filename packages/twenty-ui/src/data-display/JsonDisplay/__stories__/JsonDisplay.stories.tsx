import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { JsonDisplay } from '@ui/data-display/JsonDisplay/JsonDisplay';

const meta: Meta<typeof JsonDisplay> = {
  title: 'UI/Data Display/JsonDisplay',
  component: JsonDisplay,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof JsonDisplay>;

export const Default: Story = {
  args: {
    text: '{ "key": "value", "count": 3 }',
    maxWidth: 200,
  },
};
