import { orderObjectProperties } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/order-object-properties.util';

describe('orderObjectProperties', () => {
  it('orders simple object properties', () => {
    const input = { b: 2, a: 1 };
    const expected = { a: 1, b: 2 };

    expect(orderObjectProperties(input)).toEqual(expected);
  });

  it('orders nested object properties', () => {
    const input = { b: { d: 4, c: 3 }, a: 1 };
    const expected = { a: 1, b: { c: 3, d: 4 } };

    expect(orderObjectProperties(input)).toEqual(expected);
  });

  it('orders properties in an array of objects', () => {
    const input = [
      { b: 2, a: 1 },
      { d: 4, c: 3 },
    ];
    const expected = [
      { a: 1, b: 2 },
      { c: 3, d: 4 },
    ];

    expect(orderObjectProperties(input)).toEqual(expected);
  });

  it('handles nested arrays within objects', () => {
    const input = { b: [{ d: 4, c: 3 }], a: 1 };
    const expected = { a: 1, b: [{ c: 3, d: 4 }] };

    expect(orderObjectProperties(input)).toEqual(expected);
  });

  it('handles complex nested structures', () => {
    const input = {
      c: 3,
      a: { f: [{ j: 10, i: 9 }, 8], e: 5 },
      b: [7, { h: 6, g: 4 }],
    };
    const expected = {
      a: { e: 5, f: [{ i: 9, j: 10 }, 8] },
      b: [7, { g: 4, h: 6 }],
      c: 3,
    };

    expect(orderObjectProperties(input)).toEqual(expected);
  });
});
