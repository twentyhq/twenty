import { type FieldMetadataComplexOption } from 'twenty-shared/types';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';

import { DEFAULT_SELECT_OPTION_COLOR } from 'src/engine/metadata-modules/flat-field-metadata/constants/default-select-option-color.constant';

type SelectOptionWithOptionalColor = Omit<FieldMetadataComplexOption, 'color'> &
  Partial<Pick<FieldMetadataComplexOption, 'color'>>;

export const sanitizeSelectOptionColors = (
  options: SelectOptionWithOptionalColor[],
): FieldMetadataComplexOption[] =>
  options.map((option) => {
    const optionWithTrimmedColor =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(option, [
        'color',
      ]);

    return {
      ...optionWithTrimmedColor,
      color: optionWithTrimmedColor.color ?? DEFAULT_SELECT_OPTION_COLOR,
    };
  });
