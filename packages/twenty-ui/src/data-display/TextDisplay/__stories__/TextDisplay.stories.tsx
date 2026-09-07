import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { TextDisplay } from '@ui/data-display/TextDisplay/TextDisplay';

const meta: Meta<typeof TextDisplay> = {
  title: 'UI/Data Display/TextDisplay',
  component: TextDisplay,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof TextDisplay>;

export const Default: Story = {
  args: {
    text: 'Some text content',
  },
  parameters: {
    container: { width: 100 },
  },
};

export const MultiLine: Story = {
  args: {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    displayedMaxRows: 2,
  },
  parameters: {
    container: { width: 100 },
  },
};
