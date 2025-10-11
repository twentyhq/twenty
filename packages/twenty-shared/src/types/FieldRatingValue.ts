import { type RATING_VALUES } from '@/constants/RatingValues';

export type FieldRatingValue = (typeof RATING_VALUES)[number] | null;
