import {
  getAnchoredTerminalResizeLayout,
  getInitialTerminalLayout,
  getTerminalTargetSize,
  isTerminalMobileBounds,
} from '../utils/terminal-window-geometry';

describe('terminal-window-geometry', () => {
  it('detects mobile terminal bounds from parent width', () => {
    expect(isTerminalMobileBounds({ width: 639, height: 500 })).toBe(true);
    expect(isTerminalMobileBounds({ width: 640, height: 500 })).toBe(false);
    expect(isTerminalMobileBounds(null)).toBe(false);
  });

  it('places the initial terminal at the desktop bottom-right anchor', () => {
    expect(getInitialTerminalLayout({ width: 1000, height: 700 })).toEqual({
      position: { left: 620, top: 384 },
      size: { width: 380, height: 220 },
    });
  });

  it('places the initial terminal with mobile offsets and clamped size', () => {
    expect(getInitialTerminalLayout({ width: 360, height: 300 })).toEqual({
      position: { left: 16, top: 48 },
      size: { width: 344, height: 220 },
    });
  });

  it('returns chat and editor target sizes clamped to parent bounds', () => {
    expect(
      getTerminalTargetSize({
        bounds: { width: 1000, height: 700 },
        chatStarted: false,
        view: 'ai-chat',
      }),
    ).toEqual({ width: 380, height: 220 });

    expect(
      getTerminalTargetSize({
        bounds: { width: 1000, height: 700 },
        chatStarted: true,
        view: 'ai-chat',
      }),
    ).toEqual({ width: 380, height: 480 });

    expect(
      getTerminalTargetSize({
        bounds: { width: 500, height: 420 },
        chatStarted: true,
        view: 'editor',
      }),
    ).toEqual({ width: 484, height: 372 });
  });

  it('preserves right and bottom anchors when resizing near the lower-right quadrant', () => {
    expect(
      getAnchoredTerminalResizeLayout({
        bounds: { width: 1000, height: 700 },
        currentPosition: { left: 620, top: 384 },
        currentSize: { width: 380, height: 220 },
        targetSize: { width: 720, height: 480 },
      }),
    ).toEqual({
      position: { left: 280, top: 124 },
      size: { width: 720, height: 480 },
    });
  });

  it('preserves left and top anchors when resizing near the upper-left quadrant', () => {
    expect(
      getAnchoredTerminalResizeLayout({
        bounds: { width: 1000, height: 700 },
        currentPosition: { left: 16, top: 48 },
        currentSize: { width: 344, height: 220 },
        targetSize: { width: 380, height: 480 },
      }),
    ).toEqual({
      position: { left: 16, top: 48 },
      size: { width: 380, height: 480 },
    });
  });

  it('updates size without inventing a position before initial layout is ready', () => {
    expect(
      getAnchoredTerminalResizeLayout({
        bounds: { width: 1000, height: 700 },
        currentPosition: null,
        currentSize: { width: 380, height: 220 },
        targetSize: { width: 380, height: 480 },
      }),
    ).toEqual({
      position: null,
      size: { width: 380, height: 480 },
    });
  });
});
