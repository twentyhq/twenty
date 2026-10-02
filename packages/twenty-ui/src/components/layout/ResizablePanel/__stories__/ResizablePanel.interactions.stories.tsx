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

import { ResizablePanel } from '../ResizablePanel';

import { ControlledResizablePanel } from './ControlledResizablePanel';
import { playCancelledPanelResize } from './playCancelledPanelResize';
import { ResizablePanelDemo } from './ResizablePanelDemo';
import { UnmountingResizablePanel } from './UnmountingResizablePanel';

const meta = {
  title: 'UI/Components/ResizablePanel/Interactions',
  component: ResizablePanel,
  decorators: [ComponentDecorator],
  args: {
    side: 'right',
    defaultSize: 200,
    min: 100,
    max: 300,
    style: { position: 'relative', width: 16, height: 100 },
    onSizeChange: fn(),
    onSizeCommit: fn(),
    onResizeStart: fn(),
    onResizeEnd: fn(),
    onCollapse: fn(),
  },
} satisfies Meta<typeof ResizablePanel>;

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
    await expect(args.onSizeChange).toHaveBeenLastCalledWith(230);
    await expect(args.onSizeCommit).toHaveBeenLastCalledWith(230);
    await userEvent.keyboard('{End}{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '300');
    await expect(args.onSizeCommit).toHaveBeenCalledTimes(2);
    await userEvent.keyboard('{Home}{ArrowLeft}{ArrowDown}');
    await expect(handle).toHaveAttribute('aria-valuenow', '100');
    await expect(args.onSizeCommit).toHaveBeenCalledTimes(3);
    await expect(args.onResizeStart).not.toHaveBeenCalled();
    await expect(args.onCollapse).not.toHaveBeenCalled();
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
      <ResizablePanel {...args} side="left" aria-label="Left edge" />
      <ResizablePanel {...args} side="right" aria-label="Right edge" />
      <ResizablePanel {...args} side="top" aria-label="Top edge" />
      <ResizablePanel {...args} side="bottom" aria-label="Bottom edge" />
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
  render: (args) => <ControlledResizablePanel {...args} />,
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
        await expect(canvas.getByText('Live size: 250')).toBeVisible();
        await expect(canvas.getByText('Saved size: 200')).toBeVisible();
        await expect(args.onSizeCommit).not.toHaveBeenCalled();
        await expect(args.onResizeStart).toHaveBeenCalledTimes(1);
        await expect(args.onResizeStart).toHaveBeenCalledWith(250);
        await fireEvent.pointerMove(handle, { pointerId: 2, clientX: 0 });
        await expect(handle).toHaveAttribute('aria-valuenow', '250');
        await pointer.pointer({ target: handle, coords: { x: 1000 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '300');
        await pointer.pointer({ target: handle, coords: { x: -1000 } });
        await expect(handle).toHaveAttribute('aria-valuenow', '100');
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        await expect(args.onSizeCommit).toHaveBeenCalledTimes(1);
        await expect(args.onSizeCommit).toHaveBeenCalledWith(100);
        await expect(args.onResizeEnd).toHaveBeenLastCalledWith({
          cancelled: false,
          value: 100,
        });
        await expect(args.onCollapse).not.toHaveBeenCalled();
        await expect(canvas.getByText('Saved size: 100')).toBeVisible();
      },
    });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore saved size' }),
    );
    await expect(handle).toHaveAttribute('aria-valuenow', '240');
    handle.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByText('Saved size: 230')).toBeVisible();
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

        await expect(args.onSizeChange).toHaveBeenLastCalledWith(240);
        await expect(args.onSizeCommit).toHaveBeenCalledWith(240);
        await waitFor(() =>
          expect(handle).toHaveAttribute('aria-valuenow', '240'),
        );
      },
    });
  },
};

export const PointerCancel: Story = {
  render: (args) => <ControlledResizablePanel {...args} />,
  play: ({ canvasElement, args }) =>
    playCancelledPanelResize({
      canvasElement,
      args,
      cancellation: 'pointerCancel',
    }),
};

export const LostPointerCapture: Story = {
  play: ({ canvasElement, args }) =>
    playCancelledPanelResize({
      canvasElement,
      args,
      cancellation: 'lostPointerCapture',
    }),
};

export const Escape: Story = {
  play: ({ canvasElement, args }) =>
    playCancelledPanelResize({ canvasElement, args, cancellation: 'Escape' }),
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
        await expect(args.onCollapse).toHaveBeenCalledTimes(1);
        await expect(args.onSizeChange).not.toHaveBeenCalled();
        await expect(args.onSizeCommit).not.toHaveBeenCalled();

        await pointer.pointer({
          target: handle,
          keys: '[MouseLeft>]',
          coords: { x: 100, y: 10 },
        });
        await pointer.pointer({ target: handle, coords: { x: 106, y: 10 } });
        await pointer.pointer({ target: handle, coords: { x: 100, y: 10 } });
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        await expect(args.onCollapse).toHaveBeenCalledTimes(1);
        await expect(args.onSizeCommit).toHaveBeenCalledTimes(1);
        await expect(args.onSizeCommit).toHaveBeenCalledWith(200);
        await expect(handle).toHaveAttribute('aria-valuenow', '200');
      },
    });

    handle.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onCollapse).toHaveBeenCalledTimes(3);
    await expect(args.onSizeCommit).toHaveBeenCalledTimes(1);
    await expect(handle).toHaveFocus();
  },
};

export const CollapseMovesFocus: Story = {
  render: () => <ResizablePanelDemo side="right" min={140} max={360} />,
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
      <ResizablePanel {...args} aria-label="Notes" />
      <ResizablePanel
        {...args}
        aria-label="Activity"
        variant="gap"
        gapSize={12}
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
    await expect(args.onSizeChange).not.toHaveBeenCalled();
    await expect(args.onSizeCommit).not.toHaveBeenCalled();
    await expect(args.onCollapse).not.toHaveBeenCalled();
  },
};

export const UnmountWhileDragging: Story = {
  render: (args) => <UnmountingResizablePanel {...args} />,
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
        await expect(canvas.getByText('Live size: 250')).toBeVisible();
        canvas.getByRole('button', { name: 'Hide panel' }).focus();
        await userEvent.keyboard('{Enter}');
        await expect(canvas.queryByRole('separator')).not.toBeInTheDocument();
        await expect(canvas.getByText('Live size: 200')).toBeVisible();
        await expect(args.onResizeEnd).toHaveBeenCalledTimes(1);
        await expect(args.onResizeEnd).toHaveBeenCalledWith({
          cancelled: true,
          value: 200,
        });
        await expect(args.onSizeCommit).not.toHaveBeenCalled();
        await expect(args.onCollapse).not.toHaveBeenCalled();
        await expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
      },
    });
  },
};
