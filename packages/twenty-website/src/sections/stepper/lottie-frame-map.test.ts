import { LOTTIE_FRAME_MAP } from './lottie-frame-map';

const TOTAL = LOTTIE_FRAME_MAP.expectedTotalFrames;

describe('LOTTIE_FRAME_MAP.toFrame', () => {
  it('should pin the timeline ends', () => {
    expect(LOTTIE_FRAME_MAP.toFrame(0, TOTAL)).toBe(0);
    expect(LOTTIE_FRAME_MAP.toFrame(1, TOTAL)).toBe(TOTAL - 1);
  });

  it('should clamp out-of-range progress', () => {
    expect(LOTTIE_FRAME_MAP.toFrame(-0.5, TOTAL)).toBe(0);
    expect(LOTTIE_FRAME_MAP.toFrame(1.5, TOTAL)).toBe(TOTAL - 1);
  });

  it('should land each chapter boundary on its authored frame', () => {
    expect(LOTTIE_FRAME_MAP.toFrame(1 / 3, TOTAL)).toBeCloseTo(285, 0);
    expect(LOTTIE_FRAME_MAP.toFrame(2 / 3, TOTAL)).toBeCloseTo(925, 0);
  });

  it('should interpolate linearly inside a chapter', () => {
    expect(LOTTIE_FRAME_MAP.toFrame(1 / 6, TOTAL)).toBeCloseTo(285 / 2, 0);
    expect(LOTTIE_FRAME_MAP.toFrame(0.5, TOTAL)).toBeCloseTo(
      285 + (925 - 285) / 2,
      0,
    );
  });
});
