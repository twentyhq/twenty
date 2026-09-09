import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Input } from '@ui/input/Input/Input';
import { ComponentDecorator } from '@ui/testing';

import { AlertDialog } from '../AlertDialog';
import { AlertDialogExample } from './AlertDialogExample';
import styles from './AlertDialog.stories.module.scss';
import { waitForAlertDialog } from './waitForAlertDialog';

const meta: Meta<typeof AlertDialogExample> = {
  title: 'UI/Surfaces/AlertDialog',
  component: AlertDialogExample,
};

export default meta;
type Story = StoryObj<typeof AlertDialogExample>;

export const KeyboardAndDismissal: Story = {
  decorators: [ComponentDecorator],
  args: { onOpenChange: fn() },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Delete record' });
    const initialOverflow = canvasElement.ownerDocument.body.style.overflow;

    await step('Open from the keyboard and focus the safe action', async () => {
      trigger.focus();
      await userEvent.keyboard('{Enter}');
      const dialog = await waitForAlertDialog(canvasElement);
      expect(canvasElement.ownerDocument.body.style.overflow).toBe('hidden');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-controls', dialog.id);
      await waitFor(() =>
        expect(body.getByRole('button', { name: 'Cancel' })).toHaveFocus(),
      );
      expect(args.onOpenChange).toHaveBeenLastCalledWith(
        true,
        expect.objectContaining({ reason: 'trigger-press' }),
      );
    });

    await step('Keep forward and backward tab navigation inside', async () => {
      await userEvent.tab();
      expect(body.getByRole('button', { name: 'Delete' })).toHaveFocus();
      await userEvent.tab();
      expect(body.getByRole('button', { name: 'Cancel' })).toHaveFocus();
      await userEvent.tab({ shift: true });
      expect(body.getByRole('button', { name: 'Delete' })).toHaveFocus();
    });

    await step(
      'Require a response instead of dismissing on outside click',
      async () => {
        const dialog = body.getByRole('alertdialog');
        const viewport = dialog.parentElement;
        expect(viewport).not.toBeNull();
        await userEvent.click(viewport!);
        expect(dialog).toBeVisible();
        expect(args.onOpenChange).toHaveBeenCalledTimes(1);
      },
    );

    await step(
      'Escape dismisses and returns focus to the trigger',
      async () => {
        await userEvent.keyboard('{Escape}');
        await waitFor(() =>
          expect(body.queryByRole('alertdialog')).not.toBeInTheDocument(),
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

    await step('Cancel and confirmation both close the dialog', async () => {
      for (const name of ['Cancel', 'Delete']) {
        await userEvent.click(trigger);
        await waitForAlertDialog(canvasElement);
        await userEvent.click(body.getByRole('button', { name }));
        await waitFor(() =>
          expect(body.queryByRole('alertdialog')).not.toBeInTheDocument(),
        );
        expect(args.onOpenChange).toHaveBeenLastCalledWith(
          false,
          expect.objectContaining({ reason: 'close-press' }),
        );
      }
    });
  },
};

const ControlledAlertDialog = () => {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <>
      <p>{deleted ? 'Record deleted' : 'Record available'}</p>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger className={styles.button}>
          Delete record
        </AlertDialog.Trigger>
        <AlertDialog.Popup>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete this record?</AlertDialog.Title>
            <AlertDialog.Description>
              This action cannot be undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Close className={styles.button}>
              Cancel
            </AlertDialog.Close>
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                setDeleted(true);
                setOpen(false);
              }}
            >
              Confirm deletion
            </button>
          </AlertDialog.Footer>
        </AlertDialog.Popup>
      </AlertDialog.Root>
    </>
  );
};

export const Controlled: Story = {
  decorators: [ComponentDecorator],
  render: () => <ControlledAlertDialog />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Delete record' }),
    );
    const dialog = await waitForAlertDialog(canvasElement);
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Confirm deletion' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(within(canvasElement).getByText('Record deleted')).toBeVisible();
  },
};

export const DisabledTrigger: Story = {
  decorators: [ComponentDecorator],
  args: { disabled: true, onOpenChange: fn() },
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Delete record',
    });
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(args.onOpenChange).not.toHaveBeenCalled();
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('alertdialog'),
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
      name: 'Delete record',
    });
    expect(body.getByRole('alertdialog', { hidden: true })).not.toBeVisible();
    await userEvent.click(trigger);
    const dialog = await waitForAlertDialog(canvasElement);
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Reason' }),
      'Duplicate',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() => expect(dialog).not.toBeVisible());
    expect(dialog).toBeInTheDocument();
    await userEvent.click(trigger);
    await waitForAlertDialog(canvasElement);
    expect(within(dialog).getByRole('textbox', { name: 'Reason' })).toHaveValue(
      'Duplicate',
    );
  },
};

const CustomFocusAlertDialog = () => {
  const initialFocus = useRef<HTMLInputElement>(null);
  const finalFocus = useRef<HTMLButtonElement>(null);

  return (
    <>
      <AlertDialogExample
        popupProps={{ initialFocus, finalFocus }}
        content={<Input ref={initialFocus} aria-label="Confirmation" />}
      />
      <button type="button" ref={finalFocus}>
        Next record
      </button>
    </>
  );
};

export const CustomFocus: Story = {
  decorators: [ComponentDecorator],
  render: () => <CustomFocusAlertDialog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Delete record' }),
    );
    const dialog = await waitForAlertDialog(canvasElement);
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
      if (!open && eventDetails.reason === 'escape-key') eventDetails.cancel();
    },
  },
  play: async ({ canvasElement }) => {
    const dialog = await waitForAlertDialog(canvasElement);
    await userEvent.keyboard('{Escape}');
    expect(dialog).toBeVisible();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const Nested: Story = {
  decorators: [ComponentDecorator],
  args: { defaultOpen: true, content: <AlertDialogExample /> },
  play: async ({ canvasElement }) => {
    const parentDialog = await waitForAlertDialog(canvasElement);
    const nestedTrigger = within(parentDialog).getByRole('button', {
      name: 'Delete record',
    });
    await userEvent.click(nestedTrigger);
    const nestedDialog = await waitForAlertDialog(canvasElement);
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
      <p key={index}>Record {index + 1} will be removed.</p>
    )),
  },
  play: async ({ canvasElement }) => {
    const dialog = await waitForAlertDialog(canvasElement);
    expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight);
    const bounds = dialog.getBoundingClientRect();
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.bottom).toBeLessThanOrEqual(
      canvasElement.ownerDocument.documentElement.clientHeight,
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
