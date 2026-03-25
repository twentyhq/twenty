import { RATING_VALUES } from '@/constants';
import { type FieldRatingValue } from '@/types';

export const convertGreaterThanOrEqualRatingToArrayOfRatingValues = (
  greaterThanValue: number,
) =>
  RATING_VALUES.filter(
    (ratingValue) => +ratingValue.split('_')[1] >= greaterThanValue,
  );

export const convertLessThanOrEqualRatingToArrayOfRatingValues = (
  lessThanValue: number,
) =>
  RATING_VALUES.filter(
    (ratingValue) => +ratingValue.split('_')[1] <= lessThanValue,
  );

export const convertRatingToRatingValue = (rating: number) =>
  `RATING_${rating}` as FieldRatingValue;
