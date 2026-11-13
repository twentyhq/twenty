import { OrderByDirection } from 'twenty-shared/types';

import { normalizeIndexFieldDirection } from 'src/engine/metadata-modules/index-metadata/utils/normalize-index-field-direction.util';

describe('normalizeIndexFieldDirection', () => {
  it.each([undefined, null, OrderByDirection.AscNullsLast])(
    'returns null for the btree default (%s)',
    (direction) => {
      expect(normalizeIndexFieldDirection(direction)).toBeNull();
    },
  );

  it.each([
    OrderByDirection.AscNullsFirst,
    OrderByDirection.DescNullsFirst,
    OrderByDirection.DescNullsLast,
  ])('keeps %s', (direction) => {
    expect(normalizeIndexFieldDirection(direction)).toBe(direction);
  });
});
