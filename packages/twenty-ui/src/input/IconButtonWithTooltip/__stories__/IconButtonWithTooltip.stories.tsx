import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconSearch } from '@ui/icon';
import { IconButtonWithTooltip } from '@ui/input/IconButtonWithTooltip/IconButtonWithTooltip';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof IconButtonWithTooltip> = {
  title: 'UI/Input/Button/IconButtonWithTooltip',
  component: IconButtonWithTooltip,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof IconButtonWithTooltip>;

export const Default: Story = {
  args: {
    Icon: IconSearch,
    ariaLabel: 'Search',
    variant: 'tertiary',
    size: 'small',
    tooltipId: 'icon-button-with-tooltip-story',
    tooltipContent: 'Search',
  },
};
