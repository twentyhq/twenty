import { isMatchingRatingFilter } from '@/utils/filter/utils/isMatchingRatingFilter';

describe('isMatchingRatingFilter', () => {
  describe('eq', () => {
    it('should return true when value equals', () => {
      expect(
        isMatchingRatingFilter({
          ratingFilter: { eq: 'RATING_3' },
          value: 'RATING_3',
        }),
      ).toBe(true);
    });

    it('should return false when value does not equal', () => {
      expect(
        isMatchingRatingFilter({
          ratingFilter: { eq: 'RATING_3' },
          value: 'RATING_1',
        }),
      ).toBe(false);
    });
  });

  describe('in', () => {
    it('should return true when value is in list', () => {
      expect(
        isMatchingRatingFilter({
          ratingFilter: { in: ['RATING_3', 'RATING_5'] },
          value: 'RATING_3',
        }),
      ).toBe(true);
    });

    it('should return false for null value', () => {
      expect(
        isMatchingRatingFilter({
          ratingFilter: { in: ['RATING_3'] },
          value: null,
        }),
      ).toBe(false);
    });
  });

  describe('is', () => {
    it('should match NULL check', () => {
      expect(
        isMatchingRatingFilter({
          ratingFilter: { is: 'NULL' },
          value: null,
        }),
      ).toBe(true);
    });

    it('should match NOT_NULL check', () => {
      expect(
        isMatchingRatingFilter({
          ratingFilter: { is: 'NOT_NULL' },
          value: 'RATING_3',
        }),
      ).toBe(true);
    });
  });

  describe('default', () => {
    it('should throw for unexpected filter', () => {
      expect(() =>
        isMatchingRatingFilter({
          ratingFilter: {} as any,
          value: 'RATING_3',
        }),
      ).toThrow('Unexpected value for rating filter');
    });
  });
});
