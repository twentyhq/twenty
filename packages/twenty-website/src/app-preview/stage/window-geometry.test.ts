import { windowGeometry, type WindowResizeState } from './window-geometry';

const baseResizeState = {
  originX: 100,
  originY: 100,
  pointerId: 1,
  startHeight: 200,
  startLeft: 100,
  startTop: 80,
  startWidth: 300,
} satisfies Omit<WindowResizeState, 'handle'>;

describe('windowGeometry', () => {
  it('should clamp a window position inside its parent bounds', () => {
    expect(
      windowGeometry.clampPosition({
        bounds: { width: 500, height: 400 },
        candidate: { left: 450, top: -20 },
        edgeGap: 0,
        size: { width: 200, height: 100 },
      }),
    ).toEqual({ left: 300, top: 0 });
  });

  it('should resize from the right edge without moving the origin', () => {
    expect(
      windowGeometry.resizeFromPointer({
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

  it('should keep the opposite edge fixed when resizing from the left', () => {
    expect(
      windowGeometry.resizeFromPointer({
        bounds: { width: 800, height: 600 },
        edgeGap: 0,
        minSize: { width: 100, height: 100 },
        pointerX: 160,
        pointerY: 100,
        state: { ...baseResizeState, handle: 'left' },
      }),
    ).toEqual({
      position: { left: 160, top: 80 },
      size: { width: 240, height: 200 },
    });
  });

  it('should respect the minimum size when shrinking', () => {
    expect(
      windowGeometry.resizeFromPointer({
        bounds: { width: 800, height: 600 },
        edgeGap: 0,
        minSize: { width: 280, height: 100 },
        pointerX: 0,
        pointerY: 100,
        state: { ...baseResizeState, handle: 'right' },
      }),
    ).toEqual({
      position: { left: 100, top: 80 },
      size: { width: 280, height: 200 },
    });
  });
});
