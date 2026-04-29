import { getHorizontalWheelScrollLeft } from '../use-horizontal-drag-scroll';

describe('getHorizontalWheelScrollLeft', () => {
  it('maps vertical wheel movement to horizontal scroll', () => {
    expect(
      getHorizontalWheelScrollLeft(
        { clientWidth: 200, scrollLeft: 40, scrollWidth: 500 },
        { deltaX: 0, deltaY: 80 },
      ),
    ).toBe(120);
  });

  it('ignores mostly horizontal wheel movement', () => {
    expect(
      getHorizontalWheelScrollLeft(
        { clientWidth: 200, scrollLeft: 40, scrollWidth: 500 },
        { deltaX: 80, deltaY: 20 },
      ),
    ).toBeNull();
  });

  it('clamps scroll to the available range', () => {
    expect(
      getHorizontalWheelScrollLeft(
        { clientWidth: 200, scrollLeft: 260, scrollWidth: 500 },
        { deltaX: 0, deltaY: 80 },
      ),
    ).toBe(300);

    expect(
      getHorizontalWheelScrollLeft(
        { clientWidth: 200, scrollLeft: 20, scrollWidth: 500 },
        { deltaX: 0, deltaY: -80 },
      ),
    ).toBe(0);
  });

  it('returns null when the scroll position would not materially change', () => {
    expect(
      getHorizontalWheelScrollLeft(
        { clientWidth: 200, scrollLeft: 0, scrollWidth: 500 },
        { deltaX: 0, deltaY: -10 },
      ),
    ).toBeNull();
  });
});
