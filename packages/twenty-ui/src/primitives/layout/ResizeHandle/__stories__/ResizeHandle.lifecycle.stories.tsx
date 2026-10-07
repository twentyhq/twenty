import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { ResizeHandle } from '../ResizeHandle';

import { DisablingResizeHandle } from './DisablingResizeHandle';
import { withMockPointerCapture } from './withMockPointerCapture';

const meta = {
  title: 'UI/Layout/ResizeHandle/Lifecycle',
  component: ResizeHandle,
  decorators: [ComponentDecorator],
  args: {
    axis: 'x',
    defaultValue: 150,
    min: 100,
    max: 200,
    dragThreshold: 4,
    onValueChange: fn(),
    onValueCommitted: fn(),
    onResizeStart: fn(),
    onResizeEnd: fn(),
    onActivate: fn(),
  },
} satisfies Meta<typeof ResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ClickAndDrag: Story = {
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');
    const pointer = userEvent.setup();

    await withMockPointerCapture({
      handle,
      run: async () => {
        await pointer.pointer({
          target: handle,
          keys: '[MouseLeft>]',
          coords: { x: 100 },
        });
        await pointer.pointer({ target: handle, coords: { x: 103 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '150');
        await expect(args.onResizeStart).not.toHaveBeenCalled();
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        await expect(args.onActivate).toHaveBeenCalledTimes(1);
        await expect(args.onValueCommitted).not.toHaveBeenCalled();
        await expect(handle).not.toHaveFocus();

        handle.focus();
        await userEvent.keyboard('{Enter} ');
        await expect(args.onActivate).toHaveBeenCalledTimes(3);
        await pointer.pointer({
          target: handle,
          keys: '[MouseLeft>]',
          coords: { x: 100 },
        });
        await pointer.pointer({ target: handle, coords: { x: 120 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '170');
        await expect(args.onResizeStart).toHaveBeenCalledTimes(1);
        await expect(args.onResizeStart).toHaveBeenCalledWith(170);
        await pointer.pointer({ target: handle, coords: { x: 125 } });
        await userEvent.keyboard('{ArrowRight}{Enter}');
        await expect(handle).toHaveAttribute('aria-valuenow', '175');
        await expect(args.onActivate).toHaveBeenCalledTimes(3);
        await expect(args.onValueCommitted).not.toHaveBeenCalled();
        await fireEvent.pointerUp(handle, { pointerId: 1, clientX: 140 });
        await fireEvent.click(handle, { detail: 1 });
        await expect(handle).toHaveAttribute('aria-valuenow', '190');
        await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
        await expect(args.onValueCommitted).toHaveBeenCalledWith(190);
        await expect(args.onResizeEnd).toHaveBeenCalledTimes(1);
        await expect(args.onResizeEnd).toHaveBeenCalledWith({
          cancelled: false,
          value: 190,
        });
        await expect(args.onActivate).toHaveBeenCalledTimes(3);
      },
    });
  },
};

export const ReleaseMovement: Story = {
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');

    await withMockPointerCapture({
      handle,
      run: async () => {
        await fireEvent.pointerDown(handle, {
          pointerId: 1,
          button: 0,
          clientX: 100,
        });
        await fireEvent.pointerUp(handle, { pointerId: 1, clientX: 300 });
        await expect(handle).toHaveAttribute('aria-valuenow', '200');
        await expect(args.onResizeStart).toHaveBeenCalledTimes(1);
        await expect(args.onResizeStart).toHaveBeenCalledWith(200);
        await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
        await expect(args.onValueCommitted).toHaveBeenCalledWith(200);
        await expect(args.onResizeEnd).toHaveBeenCalledTimes(1);
        await expect(args.onResizeEnd).toHaveBeenCalledWith({
          cancelled: false,
          value: 200,
        });
      },
    });
  },
};

export const ScaledPhysicalDirection: Story = {
  args: { direction: 'normal', scale: fn(() => 2) },
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <Story />
      </DirectionProvider>
    ),
  ],
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');
    const pointer = userEvent.setup();

    await withMockPointerCapture({
      handle,
      run: async () => {
        await pointer.pointer({
          target: handle,
          keys: '[MouseLeft>]',
          coords: { x: 100 },
        });
        await pointer.pointer({ target: handle, coords: { x: 160 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '180');
        await pointer.pointer({ target: handle, coords: { x: 240 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '200');
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        await expect(args.scale).toHaveBeenCalledTimes(1);
        await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
        await expect(args.onValueCommitted).toHaveBeenCalledWith(200);
        handle.focus();
        await userEvent.keyboard('{ArrowLeft}');
        await expect(handle).toHaveAttribute('aria-valuenow', '190');
        await expect(args.onValueCommitted).toHaveBeenLastCalledWith(190);
      },
    });
  },
};

export const ReverseVertical: Story = {
  args: { axis: 'y', direction: 'reverse' },
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');
    const pointer = userEvent.setup();

    await withMockPointerCapture({
      handle,
      run: async () => {
        await pointer.pointer({
          target: handle,
          keys: '[MouseLeft>]',
          coords: { y: 100 },
        });
        await pointer.pointer({ target: handle, coords: { y: 70 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '180');
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        handle.focus();
        await userEvent.keyboard('{ArrowDown}');
        await expect(handle).toHaveAttribute('aria-valuenow', '170');
        await expect(args.onValueCommitted).toHaveBeenLastCalledWith(170);
      },
    });
  },
};

export const EscapeCancellation: Story = {
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');
    const pointer = userEvent.setup();
    const handleDocumentKeyDown = fn();
    const ownerDocument = canvasElement.ownerDocument;

    ownerDocument.addEventListener('keydown', handleDocumentKeyDown);

    try {
      await withMockPointerCapture({
        handle,
        run: async () => {
          await pointer.pointer({
            target: handle,
            keys: '[MouseLeft>]',
            coords: { x: 100 },
          });
          await pointer.pointer({ target: handle, coords: { x: 140 } });
          await expect(handle).not.toHaveFocus();
          await userEvent.keyboard('{Escape}');
          await expect(args.onResizeEnd).toHaveBeenCalledTimes(1);
          await expect(args.onResizeEnd).toHaveBeenCalledWith({
            cancelled: true,
            value: 150,
          });
          await expect(handleDocumentKeyDown).not.toHaveBeenCalled();
          await expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
          await pointer.pointer({ target: handle, coords: { x: 180 } });
          await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
          await expect(handle).toHaveAttribute('aria-valuenow', '150');
          await expect(args.onValueCommitted).not.toHaveBeenCalled();
          await expect(args.onActivate).not.toHaveBeenCalled();
          await fireEvent.click(handle, { detail: 0 });
          await expect(args.onActivate).toHaveBeenCalledTimes(1);
        },
      });

      await userEvent.keyboard('{Escape}');
      await expect(handleDocumentKeyDown).toHaveBeenCalledTimes(1);
    } finally {
      ownerDocument.removeEventListener('keydown', handleDocumentKeyDown);
    }
  },
};

export const DisabledDuringDrag: Story = {
  render: (args) => <DisablingResizeHandle {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator');
    const pointer = userEvent.setup();

    await withMockPointerCapture({
      handle,
      run: async () => {
        await pointer.pointer({
          target: handle,
          keys: '[MouseLeft>]',
          coords: { x: 100 },
        });
        await pointer.pointer({ target: handle, coords: { x: 140 } });
        await fireEvent.click(
          canvas.getByRole('button', { name: 'Disable resizing' }),
        );
        await expect(handle).toHaveAttribute('aria-disabled', 'true');
        await pointer.pointer({ target: handle, coords: { x: 180 } });
        await expect(args.onResizeEnd).toHaveBeenCalledTimes(1);
        await expect(args.onResizeEnd).toHaveBeenCalledWith({
          cancelled: true,
          value: 150,
        });
        await expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        await expect(args.onValueCommitted).not.toHaveBeenCalled();
        await expect(args.onActivate).not.toHaveBeenCalled();
      },
    });
  },
};
