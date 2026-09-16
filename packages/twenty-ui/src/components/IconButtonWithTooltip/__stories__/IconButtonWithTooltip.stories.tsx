import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconSearch } from '@ui/icon';
import { TooltipDelay } from '@ui/primitives/surfaces';
import { ComponentDecorator } from '@ui/testing';

import { IconButtonWithTooltip } from '../IconButtonWithTooltip';

const meta: Meta<typeof IconButtonWithTooltip> = {
  title: 'UI/Components/Input/IconButtonWithTooltip',
  component: IconButtonWithTooltip,
  decorators: [ComponentDecorator],
  args: {
    children: <IconSearch />,
    'aria-label': 'Search',
    variant: 'ghost',
    size: 'sm',
    tooltipContent: 'Search records',
    tooltipDelay: TooltipDelay.noDelay,
  },
};

export default meta;
type Story = StoryObj<typeof IconButtonWithTooltip>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    button.focus();
    await expect(button).toHaveFocus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Search records');
  },
};

export const Disabled: Story = {
  args: { disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    await expect(button).toBeDisabled();
    await userEvent.hover(button);
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Search records');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Link: Story = {
  args: { href: '#search' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Search' });

    link.focus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Search records');
  },
};
