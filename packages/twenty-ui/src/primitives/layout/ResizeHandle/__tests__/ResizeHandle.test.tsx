import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ResizeHandle } from '../ResizeHandle';
import styles from '../ResizeHandle.module.scss';

const mockPointerCapture = (handle: HTMLElement) => {
  const setPointerCapture = vi.fn();
  const releasePointerCapture = vi.fn();

  Object.assign(handle, {
    setPointerCapture,
    releasePointerCapture,
    hasPointerCapture: () => true,
  });

  return { setPointerCapture, releasePointerCapture };
};

runComponentConformance({
  name: 'ResizeHandle',
  element: <ResizeHandle />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.area,
});

describe('ResizeHandle', () => {
  it('resizes with axis-specific keys and honors custom steps and bounds', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <ResizeHandle
        defaultValue={100}
        min={80}
        max={120}
        step={15}
        onValueChange={onValueChange}
      />,
    );

    const handle = screen.getByRole('separator');

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(handle).toHaveAttribute('aria-valuenow', '120');
    expect(onValueChange.mock.calls).toEqual([[115], [120]]);

    await user.keyboard('{ArrowUp}{ArrowLeft}');
    expect(handle).toHaveAttribute('aria-valuenow', '105');
    await user.keyboard('{Home}');
    expect(handle).toHaveAttribute('aria-valuenow', '80');
    await user.keyboard('{End}');
    expect(handle).toHaveAttribute('aria-valuenow', '120');
  });

  it('leaves controlled values with their owner and accepts external updates', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ResizeHandle axis="x" value={200} onValueChange={onValueChange} />,
    );
    const handle = screen.getByRole('separator');

    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenLastCalledWith(210);
    expect(handle).toHaveAttribute('aria-valuenow', '200');

    rerender(
      <ResizeHandle axis="x" value={300} onValueChange={onValueChange} />,
    );
    await user.keyboard('{ArrowLeft}');
    expect(onValueChange).toHaveBeenLastCalledWith(290);
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('captures the handle when its bar is dragged and clamps movement on the selected axis', () => {
    render(<ResizeHandle axis="x" defaultValue={150} min={100} max={220} />);
    const handle = screen.getByRole('separator');
    const { setPointerCapture } = mockPointerCapture(handle);

    fireEvent.pointerDown(handle.firstElementChild!, {
      pointerId: 7,
      clientX: 20,
    });
    fireEvent.pointerMove(handle, { pointerId: 7, clientX: 60, clientY: 900 });

    expect(setPointerCapture).toHaveBeenCalledWith(7);
    expect(handle).toHaveFocus();
    expect(handle).toHaveAttribute('aria-valuenow', '190');

    fireEvent.pointerMove(handle, { pointerId: 8, clientX: 100 });
    expect(handle).toHaveAttribute('aria-valuenow', '190');
    fireEvent.pointerMove(handle, { pointerId: 7, clientX: 500 });
    expect(handle).toHaveAttribute('aria-valuenow', '220');
    fireEvent.pointerMove(handle, { pointerId: 7, clientX: -500 });
    expect(handle).toHaveAttribute('aria-valuenow', '100');
  });

  it.each(['pointerUp', 'pointerCancel', 'lostPointerCapture'] as const)(
    'ends dragging on %s and lets the next gesture start from the current size',
    (eventName) => {
      render(<ResizeHandle defaultValue={150} />);
      const handle = screen.getByRole('separator');
      const { releasePointerCapture } = mockPointerCapture(handle);

      fireEvent.pointerDown(handle, { pointerId: 1, clientY: 10 });
      fireEvent.pointerMove(handle, { pointerId: 1, clientY: 60 });
      fireEvent[eventName](handle, { pointerId: 1 });
      fireEvent.pointerMove(handle, { pointerId: 1, clientY: 100 });
      expect(handle).toHaveAttribute('aria-valuenow', '200');
      expect(releasePointerCapture).toHaveBeenCalledWith(1);

      fireEvent.pointerDown(handle, { pointerId: 2, clientY: 60 });
      fireEvent.pointerMove(handle, { pointerId: 2, clientY: 70 });
      expect(handle).toHaveAttribute('aria-valuenow', '210');
    },
  );

  it('ignores disabled input, secondary buttons, and prevented events', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ResizeHandle disabled onValueChange={onValueChange} />,
    );
    const handle = screen.getByRole('separator');
    const { setPointerCapture } = mockPointerCapture(handle);

    fireEvent.pointerDown(handle);
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(handle).toHaveAttribute('tabindex', '-1');
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(<ResizeHandle onValueChange={onValueChange} />);
    fireEvent.pointerDown(handle, { button: 2 });
    expect(setPointerCapture).not.toHaveBeenCalled();

    rerender(
      <ResizeHandle
        onValueChange={onValueChange}
        onPointerDown={(event) => event.preventDefault()}
        onKeyDown={(event) => event.preventDefault()}
      />,
    );
    fireEvent.pointerDown(handle);
    handle.focus();
    await user.keyboard('{ArrowDown}');
    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
