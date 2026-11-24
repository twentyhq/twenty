import { relativeDateFilterUnitSchema } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';

export const EXPRESSION_DATE_UNITS =
  relativeDateFilterUnitSchema.options.filter((unit) => unit !== 'SECOND');
