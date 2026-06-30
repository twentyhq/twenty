import { type Meta, type StoryObj } from '@storybook/react-vite';

import { A11Y_DEFER_COLOR_CONTRAST } from '@ui/testing/a11yParameters';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';

import { H2Title } from '@ui/typography/H2Title/H2Title';

const args = {
  title: 'Sub title',
  description: 'Lorem ipsum dolor sit amet',
};

const meta: Meta<typeof H2Title> = {
  title: 'UI/Typography/H2Title',
  component: H2Title,
  decorators: [ComponentDecorator],
  args: {
    title: args.title,
  },
};

export default meta;

type Story = StoryObj<typeof H2Title>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const WithDescription: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args,
  decorators: [ComponentDecorator],
};
