import { DEFAULT_SELECT_OPTION_COLOR } from 'twenty-shared/constants';
import { type FieldMetadataComplexOption } from 'twenty-shared/types';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

type SelectOptionWithOptionalColor<TColor extends string> = Omit<
  FieldMetadataComplexOption,
  'color'
> & { color?: TColor | null };

export const sanitizeSelectOptions = <TColor extends string>(
  options: SelectOptionWithOptionalColor<TColor>[],
) =>
  options.map((option) => {
    const { color, description } = extractAndSanitizeObjectStringFields(
      option,
      ['color', 'description'],
    );

    return {
      ...option,
      color: color ?? DEFAULT_SELECT_OPTION_COLOR,
      ...(isDefined(description)
        ? { description: description === '' ? null : description }
        : {}),
    };
  });
