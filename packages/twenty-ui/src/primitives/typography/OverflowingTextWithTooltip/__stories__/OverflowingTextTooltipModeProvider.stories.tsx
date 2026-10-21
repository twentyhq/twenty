import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  OverflowingTextTooltipModeProvider,
  OverflowingTextWithTooltip,
  Text,
} from '@ui/primitives/typography';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof OverflowingTextTooltipModeProvider> = {
  title: 'UI/Typography/OverflowingTextTooltipModeProvider',
  component: OverflowingTextTooltipModeProvider,
  decorators: [ComponentDecorator],
  args: { mode: 'measure-on-hover' },
  argTypes: {
    children: { control: false, table: { disable: true } },
    mode: {
      control: 'select',
      options: ['measure-on-hover', 'measure-on-open', 'disabled'],
    },
  },
  render: ({ mode }) => (
    <OverflowingTextTooltipModeProvider mode={mode}>
      <Text style={{ maxWidth: 220 }}>
        <OverflowingTextWithTooltip
          text="Quarterly account review and renewal preparation"
          isFocusable
        />
      </Text>
    </OverflowingTextTooltipModeProvider>
  ),
};

export default meta;
type Story = StoryObj<typeof OverflowingTextTooltipModeProvider>;

export const Display: Story = {};

export const Disabled: Story = { args: { mode: 'disabled' } };
