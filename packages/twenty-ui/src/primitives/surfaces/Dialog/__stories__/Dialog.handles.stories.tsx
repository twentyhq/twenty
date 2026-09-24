import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Dialog } from '../Dialog';
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
          <Dialog.Popup>
            <Dialog.Header>
              <Dialog.Title>{payload}</Dialog.Title>
              <Dialog.Description>Review company details.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close render={<Button>Close</Button>} />
            </Dialog.Footer>
          </Dialog.Popup>
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
