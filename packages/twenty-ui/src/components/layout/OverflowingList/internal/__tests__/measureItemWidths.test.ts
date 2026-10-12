import { measureItemWidths } from '../measureItemWidths';

const createMeasuredItem = ({
  clientWidth,
  scrollWidth,
}: {
  clientWidth: number;
  scrollWidth: number;
}) => {
  const item = document.createElement('div');

  Object.defineProperties(item, {
    clientWidth: { value: clientWidth },
    scrollWidth: { value: scrollWidth },
  });

  return item;
};

describe('measureItemWidths', () => {
  it('keeps the natural width of an item whose measured layout is still squeezed', () => {
    const items = document.createElement('div');
    const itemElements = [
      createMeasuredItem({ clientWidth: 120, scrollWidth: 120 }),
      createMeasuredItem({ clientWidth: 52, scrollWidth: 120 }),
    ];

    expect(
      measureItemWidths({
        items,
        itemElements,
        supportsSynchronousLayout: true,
      }),
    ).toEqual([120, 120]);
    expect(items.hasAttribute('data-measuring')).toBe(false);
  });

  it('reads scroll widths when synchronous layout is unavailable', () => {
    const items = document.createElement('div');
    const itemElements = [
      createMeasuredItem({ clientWidth: 90, scrollWidth: 96 }),
    ];

    expect(
      measureItemWidths({
        items,
        itemElements,
        supportsSynchronousLayout: false,
      }),
    ).toEqual([96]);
  });
});
