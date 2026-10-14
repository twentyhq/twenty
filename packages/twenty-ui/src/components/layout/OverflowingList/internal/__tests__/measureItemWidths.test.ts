import { measureItemWidths } from '../measureItemWidths';

const createMeasuredItem = ({
  items,
  clientWidth,
  scrollWidth,
}: {
  items: HTMLElement;
  clientWidth: number;
  scrollWidth: number;
}) => {
  const item = document.createElement('div');

  Object.defineProperties(item, {
    clientWidth: {
      get: () => (items.hasAttribute('data-measuring') ? clientWidth : 0),
    },
    scrollWidth: { value: scrollWidth },
  });

  return item;
};

describe('measureItemWidths', () => {
  it('reads client widths while the measuring layout is applied', () => {
    const items = document.createElement('div');
    const itemElements = [
      createMeasuredItem({ items, clientWidth: 120, scrollWidth: 124 }),
      createMeasuredItem({ items, clientWidth: 90, scrollWidth: 96 }),
    ];

    expect(
      measureItemWidths({
        items,
        itemElements,
        supportsSynchronousLayout: true,
      }),
    ).toEqual([120, 90]);
    expect(items.hasAttribute('data-measuring')).toBe(false);
  });

  it('reads scroll widths when synchronous layout is unavailable', () => {
    const items = document.createElement('div');
    const itemElements = [
      createMeasuredItem({ items, clientWidth: 90, scrollWidth: 96 }),
    ];

    expect(
      measureItemWidths({
        items,
        itemElements,
        supportsSynchronousLayout: false,
      }),
    ).toEqual([96]);
    expect(items.hasAttribute('data-measuring')).toBe(false);
  });
});
