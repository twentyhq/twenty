import { isDefined } from 'twenty-shared/utils';

import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';

type FieldMetadataOption = {
  value: string;
  position: number;
};

type SortBySelectOptionPositionParams<T> = {
  items: T[];
  options: FieldMetadataOption[];
  formattedToRawLookup: Map<string, RawDimensionValue>;
  getFormattedValue: (item: T) => string;
  direction: 'ASC' | 'DESC';
};

export const sortBySelectOptionPosition = <T>({
  items,
  options,
  formattedToRawLookup,
  getFormattedValue,
  direction,
}: SortBySelectOptionPositionParams<T>): T[] => {
  const optionValueToPosition = new Map<string, number>();

  for (const option of options) {
    optionValueToPosition.set(option.value, option.position);
  }

  return [...items].sort((a, b) => {
    const formattedA = getFormattedValue(a);
    const formattedB = getFormattedValue(b);

    const rawA = formattedToRawLookup.get(formattedA);
    const rawB = formattedToRawLookup.get(formattedB);

    const positionA = isDefined(rawA)
      ? (optionValueToPosition.get(String(rawA)) ?? Number.MAX_SAFE_INTEGER)
      : Number.MAX_SAFE_INTEGER;

    const positionB = isDefined(rawB)
      ? (optionValueToPosition.get(String(rawB)) ?? Number.MAX_SAFE_INTEGER)
      : Number.MAX_SAFE_INTEGER;

    return direction === 'ASC' ? positionA - positionB : positionB - positionA;
  });
};
