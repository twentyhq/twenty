import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Dialog } from '../Dialog';
import { type DialogRootActions } from '../types/DialogRootActions';
import { type DialogRootProps } from '../types/DialogRootProps';
import { waitForDialog } from './waitForDialog';

const ExternalTriggerDialog = () => {
  const [handle] = useState(() => Dialog.createHandle<string>());

  return (
    <>
      {['Acme', 'Globex'].map((company) => (
        <Dialog.Trigger
          key={company}
          handle={handle}
          payload={company}
          render={<Button>Edit {company}</Button>}
        />
      ))}
      <Dialog.Root handle={handle}>
        {({ payload }) => (
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Viewport>
              <Dialog.Popup>
                <Dialog.Header>
                  <Dialog.Title>{payload}</Dialog.Title>
                  <Dialog.Description>
                    Review company details.
                  </Dialog.Description>
                </Dialog.Header>
                <Dialog.Footer>
                  <Dialog.Close render={<Button>Close</Button>} />
                </Dialog.Footer>
              </Dialog.Popup>
            </Dialog.Viewport>
          </Dialog.Portal>
        )}
      </Dialog.Root>
    </>
  );
};

const meta: Meta<typeof ExternalTriggerDialog> = {
  title: 'UI/Surfaces/Dialog',
  component: ExternalTriggerDialog,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof ExternalTriggerDialog>;

export const ExternalTriggers: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const company of ['Acme', 'Globex']) {
      const trigger = canvas.getByRole('button', { name: `Edit ${company}` });
      await userEvent.click(trigger);
      const dialog = await waitForDialog(canvasElement);
      expect(dialog).toHaveAccessibleName(company);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-controls', dialog.id);
      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Close' }),
      );
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    }
  },
};

const ImperativeDialog = ({
  onOpenChange,
}: Pick<DialogRootProps, 'onOpenChange'>) => {
  const [handle] = useState(() => Dialog.createHandle<string>());
  const actionsRef = useRef<DialogRootActions>(null);

  return (
    <>
      <Button onClick={() => handle.openWithPayload('Acme')}>
        Open company review
      </Button>
      <Dialog.Root
        handle={handle}
        actionsRef={actionsRef}
        onOpenChange={onOpenChange}
      >
        {({ payload }) => (
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Viewport>
              <Dialog.Popup>
                <Dialog.Header>
                  <Dialog.Title>{payload}</Dialog.Title>
                  <Dialog.Description>
                    Review company details.
                  </Dialog.Description>
                </Dialog.Header>
                <Dialog.Footer>
                  <Button onClick={() => handle.close()}>
                    Close with handle
                  </Button>
                  <Button onClick={() => actionsRef.current?.close()}>
                    Close with actions
                  </Button>
                  <Dialog.Close render={<Button>Close</Button>} />
                </Dialog.Footer>
              </Dialog.Popup>
            </Dialog.Viewport>
          </Dialog.Portal>
        )}
      </Dialog.Root>
    </>
  );
};

export const ImperativeHandleAndActions: StoryObj<typeof ImperativeDialog> = {
  args: { onOpenChange: fn() },
  render: (args) => <ImperativeDialog {...args} />,
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Open company review',
    });

    for (const name of ['Close with handle', 'Close with actions']) {
      await userEvent.click(trigger);

      const dialog = await waitForDialog(canvasElement);

      expect(dialog).toHaveAccessibleName('Acme');
      expect(args.onOpenChange).toHaveBeenLastCalledWith(
        true,
        expect.objectContaining({ reason: 'imperative-action' }),
      );

      await userEvent.click(within(dialog).getByRole('button', { name }));
      await waitFor(() => expect(dialog).not.toBeInTheDocument());

      expect(args.onOpenChange).toHaveBeenLastCalledWith(
        false,
        expect.objectContaining({ reason: 'imperative-action' }),
      );
    }
  },
};
