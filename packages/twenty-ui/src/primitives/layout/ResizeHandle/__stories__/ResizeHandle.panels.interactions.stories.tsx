import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import { withMockPointerCapture } from '@ui/primitives/layout/ResizeHandle/__stories__/withMockPointerCapture';
import { ComponentDecorator } from '@ui/testing';

import { ResizeHandle } from '../ResizeHandle';

import { ControlledResizeHandlePanel } from './ControlledResizeHandlePanel';
import { playCancelledResize } from './playCancelledResize';
import { ResizeHandlePanelDemo } from './ResizeHandlePanelDemo';
import { UnmountingResizeHandle } from './UnmountingResizeHandle';

const meta = {
  id: 'ui-layout-resizehandle-panels-interactions',
  title: 'UI/Layout/ResizeHandle/Panels/Interactions',
  component: ResizeHandle,
  decorators: [ComponentDecorator],
  render: (args) => <ControlledResizeHandlePanel {...args} />,
  args: {
    edge: 'right',
    value: 200,
    min: 100,
    max: 300,
    style: { position: 'relative', width: 16, height: 100 },
    onValueChange: fn(),
    onValueCommitted: fn(),
    onResizeStart: fn(),
    onResizeEnd: fn(),
    onActivate: fn(),
  },
} satisfies Meta<typeof ResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Keyboard: Story = {
  args: { step: 30 },
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');

    await userEvent.tab();
    await expect(handle).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '230');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(230);
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(230);
    await userEvent.keyboard('{End}{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '300');
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(2);
    await userEvent.keyboard('{Home}{ArrowLeft}{ArrowDown}');
    await expect(handle).toHaveAttribute('aria-valuenow', '100');
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(3);
    await expect(args.onResizeStart).not.toHaveBeenCalled();
    await expect(args.onActivate).not.toHaveBeenCalled();
  },
};

export const PhysicalEdges: Story = {
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <Story />
      </DirectionProvider>
    ),
  ],
  render: (args) => (
    <>
      <ControlledResizeHandlePanel
        {...args}
        axis={undefined}
        direction={undefined}
        edge="left"
        aria-label="Left edge"
      />
      <ControlledResizeHandlePanel
        {...args}
        axis={undefined}
        direction={undefined}
        edge="right"
        aria-label="Right edge"
      />
      <ControlledResizeHandlePanel
        {...args}
        axis={undefined}
        direction={undefined}
        edge="top"
        aria-label="Top edge"
      />
      <ControlledResizeHandlePanel
        {...args}
        axis={undefined}
        direction={undefined}
        edge="bottom"
        aria-label="Bottom edge"
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cases = [
      {
        name: 'Left edge',
        key: '{ArrowLeft}',
        x: -20,
        y: 0,
        orientation: 'vertical',
      },
      {
        name: 'Right edge',
        key: '{ArrowRight}',
        x: 20,
        y: 0,
        orientation: 'vertical',
      },
      {
        name: 'Top edge',
        key: '{ArrowUp}',
        x: 0,
        y: -20,
        orientation: 'horizontal',
      },
      {
        name: 'Bottom edge',
        key: '{ArrowDown}',
        x: 0,
        y: 20,
        orientation: 'horizontal',
      },
    ];

    for (const { name, key, x, y, orientation } of cases) {
      const handle = canvas.getByRole('separator', { name });
      const pointer = userEvent.setup();

      handle.focus();
      await userEvent.keyboard(key);
      await expect(handle).toHaveAttribute('aria-valuenow', '210');
      await expect(handle).toHaveAttribute('aria-orientation', orientation);
      await expect(getComputedStyle(handle).cursor).toBe(
        orientation === 'vertical' ? 'col-resize' : 'row-resize',
      );
      await withMockPointerCapture({
        handle,
        run: async () => {
          await pointer.pointer({
            target: handle,
            keys: '[MouseLeft>]',
            coords: { x: 100, y: 100 },
          });
          await pointer.pointer({
            target: handle,
            coords: { x: 100 + x, y: 100 + y },
          });
          await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
          await expect(handle).toHaveAttribute('aria-valuenow', '230');
        },
      });
    }
  },
};

export const ControlledZoomAndLimits: Story = {
  args: { scale: () => 2 },
  render: (args) => <ControlledResizeHandlePanel {...args} />,
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
          coords: { x: 100, y: 10 },
        });
        await pointer.pointer({ target: handle, coords: { x: 200, y: 900 } });
        await expect(handle.setPointerCapture).toHaveBeenCalledWith(1);
        await expect(handle).not.toHaveFocus();
        await expect(handle).toHaveAttribute('aria-valuenow', '250');
        await expect(canvas.getByText('Live value: 250')).toBeVisible();
        await expect(canvas.getByText('Saved value: 200')).toBeVisible();
        await expect(args.onValueCommitted).not.toHaveBeenCalled();
        await expect(args.onResizeStart).toHaveBeenCalledTimes(1);
        await expect(args.onResizeStart).toHaveBeenCalledWith(250);
        await fireEvent.pointerMove(handle, { pointerId: 2, clientX: 0 });
        await expect(handle).toHaveAttribute('aria-valuenow', '250');
        await pointer.pointer({ target: handle, coords: { x: 1000 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '300');
        await pointer.pointer({ target: handle, coords: { x: -1000 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '100');
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
        await expect(args.onValueCommitted).toHaveBeenCalledWith(100);
        await expect(args.onResizeEnd).toHaveBeenLastCalledWith({
          cancelled: false,
          value: 100,
        });
        await expect(args.onActivate).not.toHaveBeenCalled();
        await expect(canvas.getByText('Saved value: 100')).toBeVisible();
      },
    });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore saved size' }),
    );
    await expect(handle).toHaveAttribute('aria-valuenow', '240');
    handle.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByText('Saved value: 230')).toBeVisible();
  },
};

export const FastPointerMoves: Story = {
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
        await fireEvent.pointerMove(handle, { pointerId: 1, clientX: 140 });
        await waitFor(() =>
          expect(handle).toHaveAttribute('aria-valuenow', '240'),
        );

        for (const [type, clientX] of [
          ['pointermove', 170],
          ['pointermove', 140],
          ['pointerup', 140],
        ] as const) {
          handle.dispatchEvent(
            new PointerEvent(type, { bubbles: true, pointerId: 1, clientX }),
          );
        }

        await expect(args.onValueChange).toHaveBeenLastCalledWith(240);
        await expect(args.onValueCommitted).toHaveBeenCalledWith(240);
        await waitFor(() =>
          expect(handle).toHaveAttribute('aria-valuenow', '240'),
        );
      },
    });
  },
};

export const PointerCancel: Story = {
  render: (args) => <ControlledResizeHandlePanel {...args} />,
  play: ({ canvasElement, args }) =>
    playCancelledResize({
      canvasElement,
      args,
      cancellation: 'pointerCancel',
    }),
};

export const LostPointerCapture: Story = {
  play: ({ canvasElement, args }) =>
    playCancelledResize({
      canvasElement,
      args,
      cancellation: 'lostPointerCapture',
    }),
};

export const Escape: Story = {
  play: ({ canvasElement, args }) =>
    playCancelledResize({ canvasElement, args, cancellation: 'Escape' }),
};

export const CollapseAndDrag: Story = {
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');
    const pointer = userEvent.setup();

    await withMockPointerCapture({
      handle,
      run: async () => {
        await pointer.pointer({
          target: handle,
          keys: '[MouseLeft>]',
          coords: { x: 100, y: 10 },
        });
        await pointer.pointer({ target: handle, coords: { x: 104, y: 10 } });
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        await expect(args.onActivate).toHaveBeenCalledTimes(1);
        await expect(args.onValueChange).not.toHaveBeenCalled();
        await expect(args.onValueCommitted).not.toHaveBeenCalled();

        await pointer.pointer({
          target: handle,
          keys: '[MouseLeft>]',
          coords: { x: 100, y: 10 },
        });
        await pointer.pointer({ target: handle, coords: { x: 106, y: 10 } });
        await pointer.pointer({ target: handle, coords: { x: 100, y: 10 } });
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        await expect(args.onActivate).toHaveBeenCalledTimes(1);
        await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
        await expect(args.onValueCommitted).toHaveBeenCalledWith(200);
        await expect(handle).toHaveAttribute('aria-valuenow', '200');
      },
    });

    handle.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onActivate).toHaveBeenCalledTimes(3);
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(handle).toHaveFocus();
  },
};

export const DragPinnedAtBound: Story = {
  args: { value: 300 },
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');
    const pointer = userEvent.setup();

    await withMockPointerCapture({
      handle,
      run: async () => {
        await pointer.pointer({
          target: handle,
          keys: '[MouseLeft>]',
          coords: { x: 100, y: 10 },
        });
        await pointer.pointer({ target: handle, coords: { x: 160, y: 10 } });
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        await expect(handle).toHaveAttribute('aria-valuenow', '300');
        await expect(args.onResizeStart).toHaveBeenCalledWith(300);
        await expect(args.onActivate).not.toHaveBeenCalled();
      },
    });
  },
};

export const CollapseMovesFocus: Story = {
  render: () => (
    <ResizeHandlePanelDemo edge="right" value={220} min={140} max={360} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(
      canvas.getByRole('separator', { name: 'Resize notes' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('button', { name: 'Show notes' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('separator', { name: 'Resize notes' }),
    ).toHaveFocus();
  },
};

export const IndependentInstances: Story = {
  render: (args) => (
    <>
      <ControlledResizeHandlePanel {...args} aria-label="Notes" />
      <ControlledResizeHandlePanel
        {...args}
        aria-label="Activity"
        placement="gap"
        style={{ width: 12, height: 100 }}
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const notes = canvas.getByRole('separator', { name: 'Notes' });
    const activity = canvas.getByRole('separator', { name: 'Activity' });

    notes.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(notes).toHaveAttribute('aria-valuenow', '210');
    await expect(activity).toHaveAttribute('aria-valuenow', '200');
    activity.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(activity).toHaveAttribute('aria-valuenow', '190');
    await expect(notes).toHaveAttribute('aria-valuenow', '210');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const handle = within(canvasElement).getByRole('separator');

    await expect(handle).toHaveAttribute('aria-disabled', 'true');
    await expect(handle).toHaveAttribute('tabindex', '-1');
    await expect(handle).not.toHaveAttribute('aria-keyshortcuts');
    await userEvent.tab();
    await expect(handle).not.toHaveFocus();
    await userEvent.click(handle);
    await expect(handle).not.toHaveFocus();
    handle.focus();
    await userEvent.keyboard('{ArrowRight}{Enter} ');
    await expect(handle).toHaveAttribute('aria-valuenow', '200');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
    await expect(args.onActivate).not.toHaveBeenCalled();
  },
};

export const UnmountWhileDragging: Story = {
  render: (args) => <UnmountingResizeHandle {...args} />,
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
          coords: { x: 100, y: 10 },
        });
        await pointer.pointer({ target: handle, coords: { x: 150, y: 10 } });
        await expect(canvas.getByText('Live value: 250')).toBeVisible();
        canvas.getByRole('button', { name: 'Hide panel' }).focus();
        await userEvent.keyboard('{Enter}');
        await expect(canvas.queryByRole('separator')).not.toBeInTheDocument();
        await expect(canvas.getByText('Live value: 200')).toBeVisible();
        await expect(args.onResizeEnd).toHaveBeenCalledTimes(1);
        await expect(args.onResizeEnd).toHaveBeenCalledWith({
          cancelled: true,
          value: 200,
        });
        await expect(args.onValueCommitted).not.toHaveBeenCalled();
        await expect(args.onActivate).not.toHaveBeenCalled();
        await expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
      },
    });
  },
};
