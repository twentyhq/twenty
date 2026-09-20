import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconInfoCircle } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Tooltip } from '../Tooltip';

const findTooltip = async (canvasElement: HTMLElement) => {
  const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
    'tooltip',
  );

  await waitFor(() => expect(tooltip).toBeVisible());

  return tooltip;
};

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Surfaces/Tooltip',
  component: Tooltip,
  decorators: [ComponentDecorator],
  args: {
    content: 'Amount',
    side: 'bottom',
    delay: 300,
  },
  render: (args) => (
    <Tooltip {...args}>
      <span>
        <Button>Show details</Button>
      </span>
    </Tooltip>
  ),
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    expect(await findTooltip(canvasElement)).toHaveTextContent('Amount');
  },
};

export const Documentation: Story = {};

export const WithArrow: Story = {
  ...Default,
  args: { arrow: true },
};

export const WithDescription: Story = {
  ...Default,
  args: {
    content: (
      <Tooltip.Content description="The amount of this opportunity">
        Amount
      </Tooltip.Content>
    ),
  },
};

export const WithIcon: Story = {
  ...Default,
  args: {
    content: (
      <Tooltip.Content
        startIcon={<IconInfoCircle />}
        description="The amount of this opportunity"
      >
        Amount
      </Tooltip.Content>
    ),
  },
};

export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();

    expect(within(canvasElement).getByRole('button')).toHaveFocus();
    expect(await findTooltip(canvasElement)).toHaveTextContent('Amount');

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
    expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};

const ControlledExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip content="Amount" open={open} onOpenChange={setOpen}>
      <span>
        <Button>Show details</Button>
      </span>
    </Tooltip>
  );
};

export const Controlled: Story = {
  ...Default,
  render: () => <ControlledExample />,
};

export const DisabledButton: Story = {
  ...Default,
  render: (args) => (
    <Tooltip {...args}>
      <span>
        <Button disabled>Show details</Button>
      </span>
    </Tooltip>
  ),
};

export const Hoverable: Story = {
  args: { closeDelay: 100 },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
    const tooltip = await findTooltip(canvasElement);

    await userEvent.hover(tooltip);
    expect(tooltip).toBeVisible();

    await userEvent.unhover(tooltip);

    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const WithMaxWidth: Story = {
  ...Default,
  args: {
    maxWidth: '200px',
    content: (
      <Tooltip.Content description="A longer description that wraps naturally within the maximum tooltip width.">
        Amount
      </Tooltip.Content>
    ),
  },
};

export const CustomContent: Story = {
  ...Default,
  args: { content: <strong>Amount in workspace currency</strong> },
};

export const SharedPopup: Story = {
  render: () => (
    <Tooltip.Root<string>>
      {({ payload }) => (
        <>
          <Tooltip.Trigger payload="First amount" render={<span />}>
            <Button>First field</Button>
          </Tooltip.Trigger>
          <Tooltip.Trigger payload="Second amount" render={<span />}>
            <Button>Second field</Button>
          </Tooltip.Trigger>
          <Tooltip.Popup>{payload}</Tooltip.Popup>
        </>
      )}
    </Tooltip.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole('button', { name: 'First field' }));
    expect(await findTooltip(canvasElement)).toHaveTextContent('First amount');

    await userEvent.hover(canvas.getByRole('button', { name: 'Second field' }));

    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).getByRole('tooltip'),
      ).toHaveTextContent('Second amount'),
    );
  },
};

export const Hidden: Story = {
  args: { disabled: true, open: true },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
  },
};
