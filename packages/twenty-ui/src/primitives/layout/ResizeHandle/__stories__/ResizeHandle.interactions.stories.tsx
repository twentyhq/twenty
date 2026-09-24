import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { ResizeHandle } from '../ResizeHandle';

import { ControlledResizeHandle } from './ControlledResizeHandle';
import { withMockPointerCapture } from './withMockPointerCapture';

const meta = {
  title: 'UI/Layout/ResizeHandle/Interactions',
  component: ResizeHandle,
  decorators: [ComponentDecorator],
  args: { onValueChange: fn() },
} satisfies Meta<typeof ResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Keyboard: Story = {
  args: { defaultValue: 100, min: 80, max: 120, step: 15 },
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');

    await userEvent.tab();
    await expect(handle).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await expect(handle).toHaveAttribute('aria-valuenow', '120');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await expect(args.onValueChange).toHaveBeenNthCalledWith(1, 115);
    await expect(args.onValueChange).toHaveBeenNthCalledWith(2, 120);

    await userEvent.keyboard('{ArrowUp}{ArrowLeft}');
    await expect(handle).toHaveAttribute('aria-valuenow', '105');
    await userEvent.keyboard('{Home}');
    await expect(handle).toHaveAttribute('aria-valuenow', '80');
    await userEvent.keyboard('{End}');
    await expect(handle).toHaveAttribute('aria-valuenow', '120');
  },
};

export const Controlled: Story = {
  args: { axis: 'x' },
  render: (args) => <ControlledResizeHandle {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator');

    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(210);
    await expect(handle).toHaveAttribute('aria-valuenow', '200');

    await userEvent.click(canvas.getByRole('button', { name: 'Apply size' }));
    await expect(handle).toHaveAttribute('aria-valuenow', '300');
    handle.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(290);
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
  },
};

export const PointerDrag: Story = {
  args: { axis: 'x', defaultValue: 150, min: 100, max: 220 },
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator');
    const pointer = userEvent.setup();

    await withMockPointerCapture({
      handle,
      run: async () => {
        await pointer.pointer({
          target: handle.firstElementChild!,
          keys: '[MouseLeft>]',
          coords: { x: 20, y: 0 },
        });
        await pointer.pointer({ target: handle, coords: { x: 60, y: 900 } });
        await expect(handle.setPointerCapture).toHaveBeenCalledWith(1);
        await expect(handle).toHaveFocus();
        await expect(handle).toHaveAttribute('aria-valuenow', '190');

        await fireEvent.pointerMove(handle, { pointerId: 2, clientX: 100 });
        await expect(handle).toHaveAttribute('aria-valuenow', '190');
        await pointer.pointer({ target: handle, coords: { x: 500, y: 900 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '220');
        await pointer.pointer({ target: handle, coords: { x: -500, y: 900 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '100');
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
      },
    });
  },
};

const playPointerEnd = async ({
  canvasElement,
  eventName,
}: {
  canvasElement: HTMLElement;
  eventName: 'pointerUp' | 'pointerCancel' | 'lostPointerCapture';
}) => {
  const handle = within(canvasElement).getByRole('separator');
  const pointer = userEvent.setup();

  await withMockPointerCapture({
    handle,
    run: async () => {
      await pointer.pointer({
        target: handle,
        keys: '[MouseLeft>]',
        coords: { y: 10 },
      });
      await pointer.pointer({ target: handle, coords: { y: 60 } });
      await fireEvent[eventName](handle, { pointerId: 1 });
      await pointer.pointer({ target: handle, coords: { y: 100 } });
      await expect(handle).toHaveAttribute('aria-valuenow', '200');
      await expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);

      await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
      await pointer.pointer({
        target: handle,
        keys: '[MouseLeft>]',
        coords: { y: 60 },
      });
      await pointer.pointer({ target: handle, coords: { y: 70 } });
      await expect(handle).toHaveAttribute('aria-valuenow', '210');
      await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
    },
  });
};

export const PointerRelease: Story = {
  play: ({ canvasElement }) =>
    playPointerEnd({ canvasElement, eventName: 'pointerUp' }),
};

export const PointerCancel: Story = {
  play: ({ canvasElement }) =>
    playPointerEnd({ canvasElement, eventName: 'pointerCancel' }),
};

export const LostPointerCapture: Story = {
  play: ({ canvasElement }) =>
    playPointerEnd({ canvasElement, eventName: 'lostPointerCapture' }),
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');

    await expect(handle).toHaveAttribute('aria-disabled', 'true');
    await expect(handle).toHaveAttribute('tabindex', '-1');
    await userEvent.tab();
    await expect(handle).not.toHaveFocus();
    await userEvent.click(handle);
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(handle).toHaveAttribute('aria-valuenow', '150');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const SecondaryButton: Story = {
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');
    const pointer = userEvent.setup();

    await pointer.pointer({ target: handle, keys: '[MouseRight>]' });
    await pointer.pointer({ target: handle, coords: { y: 100 } });
    await pointer.pointer({ target: handle, keys: '[/MouseRight]' });
    await expect(handle).toHaveAttribute('aria-valuenow', '150');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const PreventedEvents: Story = {
  args: {
    onPointerDown: (event) => event.preventDefault(),
    onKeyDown: (event) => event.preventDefault(),
  },
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');
    const pointer = userEvent.setup();

    await pointer.pointer({ target: handle, keys: '[MouseLeft>]' });
    await pointer.pointer({ target: handle, coords: { y: 100 } });
    await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(handle).toHaveAttribute('aria-valuenow', '150');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const RightToLeftHorizontal: Story = {
  args: { axis: 'x', defaultValue: 100, min: 80, max: 120, step: 15 },
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator');

    handle.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(handle).toHaveAttribute('aria-valuenow', '115');
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    await expect(handle).toHaveAttribute('aria-valuenow', '100');
    await userEvent.keyboard('{Home}{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '80');
    await userEvent.keyboard('{End}{ArrowLeft}');
    await expect(handle).toHaveAttribute('aria-valuenow', '120');

    const pointer = userEvent.setup();
    await withMockPointerCapture({
      handle,
      run: async () => {
        await pointer.pointer({
          target: handle,
          keys: '[MouseLeft>]',
          coords: { x: 100 },
        });
        await pointer.pointer({ target: handle, coords: { x: 120 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '100');
        await pointer.pointer({ target: handle, coords: { x: 200 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '80');
        await pointer.pointer({ target: handle, coords: { x: 0 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '120');
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
      },
    });
  },
};

export const RightToLeftVertical: Story = {
  ...Keyboard,
  decorators: RightToLeftHorizontal.decorators,
};
