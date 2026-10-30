import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Tooltip } from '../Tooltip';
import { type TooltipRootProps } from '../types/TooltipRootProps';
import { findTooltip } from './findTooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Surfaces/Tooltip',
  component: Tooltip,
  decorators: [ComponentDecorator],
  args: { content: 'Account details' },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Account</Button>
    </Tooltip>
  ),
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

const EnableTooltipExample = () => {
  const [disabled, setDisabled] = useState(true);

  return (
    <>
      <Button onClick={() => setDisabled(false)}>Enable tooltip</Button>
      <Tooltip content="Account details" disabled={disabled}>
        <Button>Account</Button>
      </Tooltip>
    </>
  );
};

export const EnableUncontrolledTooltip: Story = {
  render: () => <EnableTooltipExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const consoleError = spyOn(console, 'error');

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Enable tooltip' }),
      );
      await userEvent.tab();

      expect(canvas.getByRole('button', { name: 'Account' })).toHaveFocus();
      expect(await findTooltip(canvasElement)).toHaveTextContent(
        'Account details',
      );
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  },
};

const TriggerHandlersExample = ({
  onFocus,
  onClick,
}: Pick<ComponentProps<typeof Button>, 'onFocus' | 'onClick'>) => (
  <Tooltip content="Account details">
    <Button onFocus={onFocus} onClick={onClick}>
      Account
    </Button>
  </Tooltip>
);

export const TriggerHandlers: StoryObj<typeof TriggerHandlersExample> = {
  args: { onFocus: fn(), onClick: fn() },
  render: (args) => <TriggerHandlersExample {...args} />,
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Account',
    });

    await userEvent.tab();

    expect(args.onFocus).toHaveBeenCalledOnce();
    expect(await findTooltip(canvasElement)).toHaveTextContent(
      'Account details',
    );

    await userEvent.click(trigger);

    expect(args.onClick).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const DescriptionWithoutTitle: Story = {
  args: { content: '', description: 'Account help' },
  play: async ({ canvasElement }) => {
    await userEvent.tab();

    expect(await findTooltip(canvasElement)).toHaveTextContent('Account help');
  },
};

export const DescriptionWithoutPayloadTitle: Story = {
  render: () => (
    <Tooltip<string>
      content={({ payload }) => payload}
      description="Account help"
    >
      <Button>Account</Button>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();

    expect(await findTooltip(canvasElement)).toHaveTextContent('Account help');
  },
};

const EmptyPayloadsExample = () => {
  const [handle] = useState(() => Tooltip.createHandle<string>());

  return (
    <>
      <Tooltip.Trigger handle={handle} render={<Button>Missing</Button>} />
      <Tooltip.Trigger
        handle={handle}
        payload=""
        render={<Button>Empty</Button>}
      />
      <Tooltip<string>
        handle={handle}
        content={({ payload }) => payload}
        triggerProps={{ payload: 'Account help' }}
      >
        <Button>Account</Button>
      </Tooltip>
    </>
  );
};

export const EmptyPayloads: Story = {
  render: () => <EmptyPayloadsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(await findTooltip(canvasElement)).toHaveTextContent('Account help');

    await userEvent.tab({ shift: true });

    expect(canvas.getByRole('button', { name: 'Empty' })).toHaveFocus();
    await waitFor(() =>
      expect(page.queryByRole('tooltip')).not.toBeInTheDocument(),
    );

    await userEvent.tab({ shift: true });

    expect(canvas.getByRole('button', { name: 'Missing' })).toHaveFocus();
    expect(page.queryByRole('tooltip')).not.toBeInTheDocument();

    await userEvent.tab();
    await userEvent.tab();
    expect(await findTooltip(canvasElement)).toHaveTextContent('Account help');
  },
};

const cancelTooltipOpening = fn<NonNullable<TooltipRootProps['onOpenChange']>>(
  (...changeArguments) => {
    const [, details] = changeArguments;
    details.cancel();
  },
);

export const CancelOpening: Story = {
  args: {
    onOpenChange: cancelTooltipOpening,
  },
  render: ({ onOpenChange }) => (
    <>
      <Tooltip content="Shorthand hint" onOpenChange={onOpenChange}>
        <Button>Shorthand</Button>
      </Tooltip>
      <Tooltip.Root onOpenChange={onOpenChange}>
        <Tooltip.Trigger render={<Button>Compound</Button>} />
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Compound hint</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    for (const name of ['Shorthand', 'Compound']) {
      const trigger = canvas.getByRole('button', { name });

      await userEvent.tab();

      const [isOpen, details] =
        cancelTooltipOpening.mock.calls.find(
          ([isOpening, changeDetails]) =>
            isOpening && changeDetails.trigger === trigger,
        ) ?? [];

      expect(isOpen).toBe(true);
      expect(details?.reason).toBe('trigger-focus');
      expect(details?.trigger).toBe(trigger);
      expect(typeof details?.event).toBe('object');
      expect(typeof details?.cancel).toBe('function');
      expect(page.queryByRole('tooltip')).not.toBeInTheDocument();
    }
  },
};
