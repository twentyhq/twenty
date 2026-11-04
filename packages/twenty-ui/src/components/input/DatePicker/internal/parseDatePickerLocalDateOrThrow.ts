import { parseDatePickerDateOrThrow } from './parseDatePickerDateOrThrow';

export const parseDatePickerLocalDateOrThrow = (value: string): Date => {
  const parsedDate = parseDatePickerDateOrThrow(value);
  const localDate = new Date(0);
  localDate.setFullYear(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth(),
    parsedDate.getUTCDate(),
  );
  localDate.setHours(0, 0, 0, 0);

  return localDate;
};
