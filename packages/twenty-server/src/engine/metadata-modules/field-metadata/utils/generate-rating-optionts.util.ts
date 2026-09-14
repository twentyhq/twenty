import { type FieldMetadataDefaultOption } from 'twenty-shared/types';
import { v4 as uuidV4 } from 'uuid';

const range = {
  start: 1,
  end: 5,
};

export function generateRatingOptions(): FieldMetadataDefaultOption[] {
  const options: FieldMetadataDefaultOption[] = [];

  for (let i = range.start; i <= range.end; i++) {
    options.push({
      id: uuidV4(),
      label: i.toString(),
      value: `RATING_${i}`,
      position: i - 1,
    });
  }

  return options;
}
