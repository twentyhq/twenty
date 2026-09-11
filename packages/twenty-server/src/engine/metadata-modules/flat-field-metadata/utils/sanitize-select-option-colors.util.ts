import { type FieldMetadataComplexOption } from 'twenty-shared/types';
import { extractAndSanitizeObjectStringFields } from 'twenty-shared/utils';

import { DEFAULT_SELECT_OPTION_COLOR } from 'src/engine/metadata-modules/flat-field-metadata/constants/default-select-option-color.constant';

type SelectOptionWithOptionalColor<TColor extends string> = Omit<
  FieldMetadataComplexOption,
  'color'
> & { color?: TColor | null };

export const sanitizeSelectOptionColors = <TColor extends string>(
  options: SelectOptionWithOptionalColor<TColor>[],
) =>
  options.map((option) => {
    const { color } = extractAndSanitizeObjectStringFields(option, ['color']);

    return {
      ...option,
      color: color ?? DEFAULT_SELECT_OPTION_COLOR,
    };
  });
