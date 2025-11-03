import { DATE_TYPE_FORMAT } from '@/constants';
import { parse } from 'date-fns';

export const getDateFromPlainDate = (plainDate: string) => {
  return parse(plainDate, DATE_TYPE_FORMAT, new Date());
};
