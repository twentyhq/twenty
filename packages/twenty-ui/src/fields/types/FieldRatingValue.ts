import { type RATING_VALUES } from '@ui/fields/constants/RatingValues';

export type FieldRatingValue = (typeof RATING_VALUES)[number] | null;
