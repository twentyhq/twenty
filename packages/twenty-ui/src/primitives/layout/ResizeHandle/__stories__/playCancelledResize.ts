import { expect, fireEvent, userEvent, within } from 'storybook/test';

import { withMockPointerCapture } from '@ui/primitives/layout/ResizeHandle/__stories__/withMockPointerCapture';

import { type ResizeHandleProps } from '../types/ResizeHandleProps';

export const playCancelledResize = async ({
  canvasElement,
  args,
  cancellation,
}: {
  canvasElement: HTMLElement;
  args: ResizeHandleProps;
  cancellation: 'pointerCancel' | 'lostPointerCapture' | 'Escape';
}) => {
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
      await pointer.pointer({ target: handle, coords: { x: 140, y: 10 } });
      await expect(handle).toHaveAttribute('aria-valuenow', '240');
      await expect(args.onValueChange).toHaveBeenLastCalledWith(240);

      await (cancellation === 'Escape'
        ? userEvent.keyboard('{Escape}')
        : fireEvent[cancellation](handle, { pointerId: 1 }));

      await expect(handle).toHaveAttribute('aria-valuenow', '200');
      await expect(args.onValueChange).toHaveBeenLastCalledWith(200);
      await expect(args.onValueCommitted).not.toHaveBeenCalled();
      await expect(args.onResizeEnd).toHaveBeenLastCalledWith({
        cancelled: true,
        value: 200,
      });
      await expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
      await pointer.pointer({ target: handle, coords: { x: 190, y: 10 } });
      await expect(handle).toHaveAttribute('aria-valuenow', '200');
      await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
      await expect(args.onActivate).not.toHaveBeenCalled();

      await pointer.pointer({
        target: handle,
        keys: '[MouseLeft>]',
        coords: { x: 100, y: 10 },
      });
      await pointer.pointer({ target: handle, coords: { x: 110, y: 10 } });
      await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
      await expect(handle).toHaveAttribute('aria-valuenow', '210');
      await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
      await expect(args.onValueCommitted).toHaveBeenCalledWith(210);
    },
  });
};
