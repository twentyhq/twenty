import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconSearch } from '@ui/icon';
import { IconButtonWithTooltip } from '@ui/input/IconButtonWithTooltip/IconButtonWithTooltip';
import { TooltipDelay } from '@ui/surfaces';
import { ComponentDecorator } from '@ui/testing';
import { expect, userEvent, within } from 'storybook/test';

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
    tooltipContent: 'Search',
    tooltipDelay: TooltipDelay.noDelay,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Search' });

    await userEvent.tab();

    await expect(button).toHaveFocus();

    const canvasBody = within(canvasElement.ownerDocument.body);

    await expect(await canvasBody.findByRole('tooltip')).toHaveTextContent(
      'Search',
    );
  },
};
