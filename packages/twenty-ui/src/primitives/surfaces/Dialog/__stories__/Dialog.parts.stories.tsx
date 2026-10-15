import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Dialog } from '../Dialog';
import { waitForDialog } from './waitForDialog';

const ComposedDialog = ({ onPopupClick }: { onPopupClick: () => void }) => (
  <Dialog.Root>
    <Dialog.Trigger render={<Button>Open composed dialog</Button>} />
    <Dialog.Portal
      data-testid="composed-portal"
      render={(props) => <article {...props} />}
    >
      <Dialog.Backdrop
        data-testid="composed-backdrop"
        render={(props, state) => (
          <aside {...props} data-render-open={state.open} />
        )}
        className={(state) =>
          state.open ? 'backdrop-open' : 'backdrop-closed'
        }
      />
      <Dialog.Viewport
        data-testid="composed-viewport"
        render={(props, state) => (
          <main {...props} data-render-open={state.open} />
        )}
        className={(state) =>
          state.open ? 'viewport-open' : 'viewport-closed'
        }
      >
        <Dialog.Popup
          render={(props, state) => (
            <section {...props} data-render-open={state.open} />
          )}
          onClick={onPopupClick}
        >
          <Dialog.Header>
            <Dialog.Title>Composed dialog</Dialog.Title>
            <Dialog.Description>
              Every part owns its element.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close render={<Button>Close composed dialog</Button>} />
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Portal>
  </Dialog.Root>
);

const meta: Meta<typeof ComposedDialog> = {
  title: 'UI/Surfaces/Dialog',
  component: ComposedDialog,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof ComposedDialog>;

export const ComposedParts: Story = {
  args: { onPopupClick: fn() },
  play: async ({ args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Open composed dialog',
    });

    await userEvent.click(trigger);

    const dialog = await waitForDialog(canvasElement);
    const portal = body.getByTestId('composed-portal');
    const backdrop = body.getByTestId('composed-backdrop');
    const viewport = body.getByTestId('composed-viewport');

    expect(portal.tagName).toBe('ARTICLE');
    expect(backdrop.tagName).toBe('ASIDE');
    expect(viewport.tagName).toBe('MAIN');
    expect(dialog.tagName).toBe('SECTION');
    expect(portal).toContainElement(backdrop);
    expect(portal).toContainElement(viewport);
    expect(viewport).toContainElement(dialog);
    expect(backdrop).not.toContainElement(dialog);
    expect(dialog).toHaveAccessibleName('Composed dialog');
    expect(dialog).toHaveAccessibleDescription('Every part owns its element.');

    for (const part of [backdrop, viewport, dialog]) {
      expect(part).toHaveAttribute('data-render-open', 'true');
    }

    expect(backdrop).toHaveClass('backdrop-open');
    expect(viewport).toHaveClass('viewport-open');

    await userEvent.click(within(dialog).getByRole('heading'));

    expect(args.onPopupClick).toHaveBeenCalledOnce();

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close composed dialog' }),
    );
    await waitFor(() => expect(portal).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
