import { DATE_TYPE_FORMAT } from '@/constants';
import { format } from 'date-fns';

export const getPlainDateFromDate = (date: Date) => {
  return format(date, DATE_TYPE_FORMAT);
};
