import { getVisibleItemCount } from '../getVisibleItemCount';

describe('getVisibleItemCount', () => {
  it('returns zero for an empty list', () => {
    expect(
      getVisibleItemCount({
        itemWidths: [],
        availableWidth: 100,
        gap: 5,
        includePartialItem: false,
      }),
    ).toBe(0);
  });

  it('keeps an oversized first item visible for truncation', () => {
    expect(
      getVisibleItemCount({
        itemWidths: [240],
        availableWidth: 100,
        gap: 5,
        includePartialItem: false,
      }),
    ).toBe(1);
  });

  it('includes every item when the items and intervening gaps fit exactly', () => {
    expect(
      getVisibleItemCount({
        itemWidths: [30, 40, 20],
        availableWidth: 100,
        gap: 5,
        includePartialItem: false,
      }),
    ).toBe(3);
  });

  it('excludes a partially fitting item when only whole items are allowed', () => {
    expect(
      getVisibleItemCount({
        itemWidths: [30, 40, 20],
        availableWidth: 90,
        gap: 5,
        includePartialItem: false,
      }),
    ).toBe(2);
  });

  it('includes a partially fitting item when partial items are allowed', () => {
    expect(
      getVisibleItemCount({
        itemWidths: [30, 40, 20],
        availableWidth: 90,
        gap: 5,
        includePartialItem: true,
      }),
    ).toBe(3);
  });

  it('excludes the next item when only its preceding gap fits', () => {
    expect(
      getVisibleItemCount({
        itemWidths: [30, 40, 20],
        availableWidth: 80,
        gap: 5,
        includePartialItem: true,
      }),
    ).toBe(2);
  });
});
