import { measureItemWidths } from '../measureItemWidths';

const createMeasuredItem = ({
  items,
  clientWidth,
}: {
  items: HTMLElement;
  clientWidth: number;
}) => {
  const item = document.createElement('div');

  Object.defineProperty(item, 'clientWidth', {
    get: () => (items.hasAttribute('data-measuring') ? clientWidth : 0),
  });

  return item;
};

describe('measureItemWidths', () => {
  it('reads client widths while the measuring layout is applied', () => {
    const items = document.createElement('div');
    const itemElements = [
      createMeasuredItem({ items, clientWidth: 120 }),
      createMeasuredItem({ items, clientWidth: 90 }),
    ];

    expect(measureItemWidths({ items, itemElements })).toEqual([120, 90]);
    expect(items.hasAttribute('data-measuring')).toBe(false);
  });
});
