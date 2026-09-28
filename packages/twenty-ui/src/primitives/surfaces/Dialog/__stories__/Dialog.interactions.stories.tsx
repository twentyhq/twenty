import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Input } from '@ui/primitives/input/Input/Input';
import { ComponentDecorator } from '@ui/testing';

import { Dialog } from '../Dialog';
import { DialogExample } from './DialogExample';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { waitForDialog } from './waitForDialog';

const meta: Meta<typeof DialogExample> = {
  title: 'UI/Surfaces/Dialog',
  component: DialogExample,
};

export default meta;
type Story = StoryObj<typeof DialogExample>;

export const KeyboardAndDismissal: Story = {
  decorators: [ComponentDecorator],
  args: { onOpenChange: fn() },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Edit account' });
    const initialOverflow = canvasElement.ownerDocument.body.style.overflow;

    await step(
      'Open from the keyboard and focus the close action',
      async () => {
        trigger.focus();
        await userEvent.keyboard('{Enter}');
        const dialog = await waitForDialog(canvasElement);
        expect(canvasElement.ownerDocument.body.style.overflow).toBe('hidden');
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(trigger).toHaveAttribute('aria-controls', dialog.id);
        await waitFor(() =>
          expect(body.getByRole('button', { name: 'Close' })).toHaveFocus(),
        );
        expect(args.onOpenChange).toHaveBeenLastCalledWith(
          true,
          expect.objectContaining({ reason: 'trigger-press' }),
        );
      },
    );

    await step('Keep forward and backward tab navigation inside', async () => {
      await userEvent.tab();
      await waitFor(() =>
        expect(body.getByRole('button', { name: 'Save' })).toHaveFocus(),
      );
      await userEvent.tab();
      await waitFor(() =>
        expect(body.getByRole('button', { name: 'Close' })).toHaveFocus(),
      );
      await userEvent.tab({ shift: true });
      await waitFor(() =>
        expect(body.getByRole('button', { name: 'Save' })).toHaveFocus(),
      );
    });

    await step(
      'Escape dismisses and returns focus to the trigger',
      async () => {
        await userEvent.keyboard('{Escape}');
        await waitFor(() =>
          expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
        );
        await waitFor(() => expect(trigger).toHaveFocus());
        expect(canvasElement.ownerDocument.body.style.overflow).toBe(
          initialOverflow,
        );
        expect(args.onOpenChange).toHaveBeenLastCalledWith(
          false,
          expect.objectContaining({ reason: 'escape-key' }),
        );
      },
    );

    await step('Close and confirmation both close the dialog', async () => {
      for (const name of ['Close', 'Save']) {
        await userEvent.click(trigger);
        await waitForDialog(canvasElement);
        await userEvent.click(body.getByRole('button', { name }));
        await waitFor(() =>
          expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
        );
        expect(args.onOpenChange).toHaveBeenLastCalledWith(
          false,
          expect.objectContaining({ reason: 'close-press' }),
        );
      }
    });
  },
};

const ControlledDialog = () => {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Text>{saved ? 'Account saved' : 'Record available'}</Text>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger render={<Button>Edit account</Button>} />
        <Dialog.Popup>
          <Dialog.Header>
            <Dialog.Title>Edit account</Dialog.Title>
            <Dialog.Description>Update the account details.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline">Close</Button>} />
            <Button
              onClick={() => {
                setSaved(true);
                setOpen(false);
              }}
            >
              Save changes
            </Button>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Root>
    </>
  );
};

export const Controlled: Story = {
  decorators: [ComponentDecorator],
  render: () => <ControlledDialog />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Edit account' }),
    );
    const dialog = await waitForDialog(canvasElement);
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Save changes' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(within(canvasElement).getByText('Account saved')).toBeVisible();
  },
};

export const DisabledTrigger: Story = {
  decorators: [ComponentDecorator],
  args: { disabled: true, onOpenChange: fn() },
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Edit account',
    });
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(args.onOpenChange).not.toHaveBeenCalled();
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
  },
};

export const KeepMounted: Story = {
  decorators: [ComponentDecorator],
  args: {
    popupProps: { keepMounted: true },
    content: <Input aria-label="Reason" />,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Edit account',
    });
    expect(body.getByRole('dialog', { hidden: true })).not.toBeVisible();
    await userEvent.click(trigger);
    const dialog = await waitForDialog(canvasElement);
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Reason' }),
      'Duplicate',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close' }),
    );
    await waitFor(() => expect(dialog).not.toBeVisible());
    expect(dialog).toBeInTheDocument();
    await userEvent.click(trigger);
    await waitForDialog(canvasElement);
    expect(within(dialog).getByRole('textbox', { name: 'Reason' })).toHaveValue(
      'Duplicate',
    );
  },
};

const CustomFocusDialog = () => {
  const initialFocus = useRef<HTMLInputElement>(null);
  const finalFocus = useRef<HTMLButtonElement>(null);

  return (
    <>
      <DialogExample
        popupProps={{ initialFocus, finalFocus }}
        content={<Input ref={initialFocus} aria-label="Confirmation" />}
      />
      <Button ref={finalFocus}>Next record</Button>
    </>
  );
};

export const CustomFocus: Story = {
  decorators: [ComponentDecorator],
  render: () => <CustomFocusDialog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit account' }));
    const dialog = await waitForDialog(canvasElement);
    await waitFor(() =>
      expect(
        within(dialog).getByRole('textbox', { name: 'Confirmation' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Next record' })).toHaveFocus(),
    );
  },
};

export const CanceledClose: Story = {
  decorators: [ComponentDecorator],
  args: {
    defaultOpen: true,
    onOpenChange: (open, eventDetails) => {
      if (!open && eventDetails.reason === 'escape-key') {
        eventDetails.cancel();
      }
    },
  },
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    await userEvent.keyboard('{Escape}');
    expect(dialog).toBeVisible();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const Nested: Story = {
  decorators: [ComponentDecorator],
  args: { defaultOpen: true, content: <DialogExample /> },
  play: async ({ canvasElement }) => {
    const parentDialog = await waitForDialog(canvasElement);
    const nestedTrigger = within(parentDialog).getByRole('button', {
      name: 'Edit account',
    });
    await userEvent.click(nestedTrigger);
    const nestedDialog = await waitForDialog(canvasElement);
    expect(nestedDialog).not.toBe(parentDialog);
    expect(nestedDialog).toHaveAttribute('data-nested');
    expect(parentDialog).toHaveAttribute('data-nested-dialog-open');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(nestedDialog).not.toBeInTheDocument());
    expect(parentDialog).toBeVisible();
    await waitFor(() => expect(nestedTrigger).toHaveFocus());
  },
};

export const Scrollable: Story = {
  decorators: [ComponentDecorator],
  args: {
    defaultOpen: true,
    content: Array.from({ length: 50 }, (_, index) => (
      <Text key={index}>Record {index + 1} details.</Text>
    )),
  },
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight);
    const bounds = dialog.getBoundingClientRect();
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.bottom).toBeLessThanOrEqual(
      canvasElement.ownerDocument.documentElement.clientHeight,
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const OutsideDismissal: Story = {
  decorators: [ComponentDecorator],
  args: { defaultOpen: true, onOpenChange: fn() },
  play: async ({ args, canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    const target = canvasElement.ownerDocument.elementFromPoint(1, 1);
    expect(target).not.toBeNull();
    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: target!,
      coords: { clientX: 1, clientY: 1 },
    });
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'outside-press' }),
    );
  },
};

export const FocusTrapWithoutScrollLock: Story = {
  decorators: [ComponentDecorator],
  args: {
    defaultOpen: true,
    modal: 'trap-focus',
    popupProps: { backdrop: false },
  },
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    expect(canvasElement.ownerDocument.body.style.overflow).not.toBe('hidden');
    const close = within(dialog).getByRole('button', { name: 'Close' });
    close.focus();
    await userEvent.tab({ shift: true });
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Save' }),
      ).toHaveFocus(),
    );
  },
};

export const ExternalStateAndFocus: Story = {
  decorators: [ComponentDecorator],
  args: {
    open: true,
    modal: false,
    disablePointerDismissal: true,
    popupProps: { initialFocus: false, finalFocus: false, backdrop: false },
  },
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    expect(canvasElement.ownerDocument.body.style.overflow).not.toBe('hidden');
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Edit account',
    });
    trigger.focus();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    expect(dialog).toBeVisible();
  },
};

const NonModalDialog = () => {
  const [pageActionCount, setPageActionCount] = useState(0);

  return (
    <>
      <Button
        style={{ position: 'fixed', insetBlockStart: 8, insetInlineStart: 8 }}
        onClick={() => setPageActionCount(pageActionCount + 1)}
      >
        Page action
      </Button>
      <Text role="status">Page actions: {pageActionCount}</Text>
      <DialogExample open modal={false} popupProps={{ backdrop: false }} />
    </>
  );
};

export const NonModalPageInteraction: Story = {
  decorators: [ComponentDecorator],
  render: () => <NonModalDialog />,
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    const canvas = within(canvasElement);
    const pageAction = canvas.getByRole('button', { name: 'Page action' });
    const bounds = pageAction.getBoundingClientRect();
    const hitTarget = canvasElement.ownerDocument.elementFromPoint(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2,
    );
    expect(pageAction.contains(hitTarget)).toBe(true);
    await userEvent.click(pageAction);
    expect(canvas.getByRole('status')).toHaveTextContent('Page actions: 1');
    expect(dialog).toBeVisible();
  },
};
