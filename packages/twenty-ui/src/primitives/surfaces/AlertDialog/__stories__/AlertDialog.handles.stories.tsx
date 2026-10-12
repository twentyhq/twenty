import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { AlertDialog } from '../AlertDialog';
import { type AlertDialogRootActions } from '../types/AlertDialogRootActions';
import { type AlertDialogRootProps } from '../types/AlertDialogRootProps';
import { waitForAlertDialog } from './waitForAlertDialog';

const ExternalTriggerAlertDialog = (props: AlertDialogRootProps<string>) => {
  const [handle] = useState(() => AlertDialog.createHandle<string>());

  return (
    <>
      <AlertDialog.Trigger
        id="delete-acme"
        handle={handle}
        payload="Acme"
        render={<Button>Delete Acme</Button>}
      />
      <AlertDialog.Trigger
        id="delete-globex"
        handle={handle}
        payload="Globex"
        nativeButton={false}
        render={<span>Delete Globex</span>}
      />
      <AlertDialog.Root {...props} handle={handle}>
        {({ payload }) => (
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
              <AlertDialog.Popup>
                <AlertDialog.Header>
                  <AlertDialog.Title>Delete {payload}?</AlertDialog.Title>
                  <AlertDialog.Description>
                    This action cannot be undone.
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Close render={<Button>Cancel</Button>} />
                </AlertDialog.Footer>
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
        )}
      </AlertDialog.Root>
    </>
  );
};

const meta: Meta<typeof ExternalTriggerAlertDialog> = {
  title: 'UI/Surfaces/AlertDialog',
  component: ExternalTriggerAlertDialog,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof ExternalTriggerAlertDialog>;

export const DetachedPayloadTriggers: Story = {
  args: { onOpenChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    for (const company of ['Acme', 'Globex']) {
      const trigger = canvas.getByRole('button', { name: `Delete ${company}` });

      if (company === 'Acme') {
        await userEvent.click(trigger);
      }

      if (company === 'Globex') {
        trigger.focus();
        await userEvent.keyboard('{Enter}');
        expect(trigger.tagName).toBe('SPAN');
      }

      const dialog = await waitForAlertDialog(canvasElement);
      expect(dialog).toHaveAccessibleName(`Delete ${company}?`);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-controls', dialog.id);
      expect(args.onOpenChange).toHaveBeenLastCalledWith(
        true,
        expect.objectContaining({ reason: 'trigger-press', trigger }),
      );
      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Cancel' }),
      );
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    }
  },
};

const ImperativeAlertDialog = ({
  onOpenChange,
}: AlertDialogRootProps<string>) => {
  const [handle] = useState(() => AlertDialog.createHandle<string>());
  const actionsRef = useRef<AlertDialogRootActions>(null);

  return (
    <>
      <Button onClick={() => handle.openWithPayload('Archived record')}>
        Open with payload
      </Button>
      <Button onClick={() => handle.open(null)}>Open without a trigger</Button>
      <Button onClick={() => actionsRef.current?.unmount()}>Finish exit</Button>
      <AlertDialog.Root
        handle={handle}
        actionsRef={actionsRef}
        onOpenChange={(open, eventDetails) => {
          if (!open) {
            eventDetails.preventUnmountOnClose();
          }

          onOpenChange?.(open, eventDetails);
        }}
      >
        {({ payload }) => (
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
              <AlertDialog.Popup>
                <AlertDialog.Header>
                  <AlertDialog.Title>
                    Delete {payload ?? 'this record'}?
                  </AlertDialog.Title>
                  <AlertDialog.Description>
                    This action cannot be undone.
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <Button onClick={() => handle.close()}>
                    Close with handle
                  </Button>
                  <Button onClick={() => actionsRef.current?.close()}>
                    Close with actions
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
        )}
      </AlertDialog.Root>
    </>
  );
};

export const ImperativeActions: Story = {
  args: { onOpenChange: fn() },
  render: (args) => <ImperativeAlertDialog {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    for (const closeAction of ['Close with handle', 'Close with actions']) {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Open with payload' }),
      );
      const dialog = await waitForAlertDialog(canvasElement);
      expect(dialog).toHaveAccessibleName('Delete Archived record?');
      expect(args.onOpenChange).toHaveBeenLastCalledWith(
        true,
        expect.objectContaining({ reason: 'imperative-action' }),
      );
      await userEvent.click(
        within(dialog).getByRole('button', { name: closeAction }),
      );
      await waitFor(() => expect(dialog).not.toBeVisible());
      expect(dialog).toBeInTheDocument();
      expect(args.onOpenChange).toHaveBeenLastCalledWith(
        false,
        expect.objectContaining({ reason: 'imperative-action' }),
      );
      await userEvent.click(
        canvas.getByRole('button', { name: 'Finish exit' }),
      );
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
    }

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open without a trigger' }),
    );
    const dialog = await waitForAlertDialog(canvasElement);
    expect(dialog).toHaveAccessibleName('Delete Archived record?');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close with handle' }),
    );
    await waitFor(() => expect(dialog).not.toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: 'Finish exit' }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
