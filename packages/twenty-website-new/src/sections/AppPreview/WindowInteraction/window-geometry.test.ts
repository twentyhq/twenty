import {
  clampWindowPosition,
  resizeWindowFromPointer,
  type WindowResizeState,
} from './window-geometry';

const baseResizeState = {
  originX: 100,
  originY: 100,
  pointerId: 1,
  startHeight: 200,
  startLeft: 100,
  startTop: 80,
  startWidth: 300,
} satisfies Omit<WindowResizeState, 'handle'>;

describe('window geometry', () => {
  it('clamps a window position inside its parent bounds', () => {
    expect(
      clampWindowPosition({
        bounds: { width: 500, height: 400 },
        candidate: { left: 450, top: -20 },
        edgeGap: 0,
        size: { width: 200, height: 100 },
      }),
    ).toEqual({ left: 300, top: 0 });
  });

  it('resizes from the right edge without moving the origin', () => {
    expect(
      resizeWindowFromPointer({
        bounds: { width: 800, height: 600 },
        edgeGap: 0,
        minSize: { width: 100, height: 100 },
        pointerX: 160,
        pointerY: 100,
        state: { ...baseResizeState, handle: 'right' },
      }),
    ).toEqual({
      position: { left: 100, top: 80 },
      size: { width: 360, height: 200 },
    });
  });

  it('resizes from the left edge while preserving the opposite edge', () => {
    expect(
      resizeWindowFromPointer({
        bounds: { width: 800, height: 600 },
        edgeGap: 0,
        minSize: { width: 100, height: 100 },
        pointerX: 40,
        pointerY: 100,
        state: { ...baseResizeState, handle: 'left' },
      }),
    ).toEqual({
      position: { left: 40, top: 80 },
      size: { width: 360, height: 200 },
    });
  });

  it('respects parent bounds and minimum size for corner resize', () => {
    expect(
      resizeWindowFromPointer({
        bounds: { width: 360, height: 260 },
        edgeGap: 0,
        minSize: { width: 240, height: 180 },
        pointerX: -200,
        pointerY: -200,
        state: { ...baseResizeState, handle: 'top-left' },
      }),
    ).toEqual({
      position: { left: 0, top: 0 },
      size: { width: 400, height: 280 },
    });
  });
});
