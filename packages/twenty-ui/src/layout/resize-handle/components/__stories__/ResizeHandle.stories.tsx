import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useResizeHandle } from '@ui/layout/resize-handle/hooks/useResizeHandle';
import { ComponentDecorator } from '@ui/testing';
import { themeCssVariables } from '@ui/theme-constants';
import { expect, userEvent, within } from 'storybook/test';

import { ResizeHandle } from '../ResizeHandle';

const INITIAL_HEIGHT = 150;

const ResizableDemo = () => {
  const { size, handleResizeStart, handleResizeMove, handleResizeEnd } =
    useResizeHandle({ initialSize: INITIAL_HEIGHT });

  return (
    <div>
      <div
        data-testid="resizable-area"
        style={{
          background: themeCssVariables.background.secondary,
          height: size,
          width: 300,
        }}
      />
      <ResizeHandle
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
      />
    </div>
  );
};

const meta: Meta<typeof ResizeHandle> = {
  title: 'UI/Layout/ResizeHandle',
  component: ResizeHandle,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof ResizeHandle>;

export const Resizable: Story = {
  render: () => <ResizableDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const resizableArea = canvas.getByTestId('resizable-area');
    const handle = resizableArea.nextElementSibling as HTMLElement;

    await expect(resizableArea).toHaveStyle({ height: `${INITIAL_HEIGHT}px` });

    // Split pointer calls so React flushes state between pointerdown and pointermove
    await userEvent.pointer({
      keys: '[MouseLeft>]',
      target: handle,
      coords: { x: 0, y: 100 },
    });
    await userEvent.pointer({ target: handle, coords: { x: 0, y: 200 } });
    await userEvent.pointer({ keys: '[/MouseLeft]' });

    await expect(resizableArea).toHaveStyle({
      height: `${INITIAL_HEIGHT + 100}px`,
    });
  },
};
