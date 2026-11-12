import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';

// Only set on options owned by another application than their field, which is what clients need to tell them apart.
export const addOptionApplicationIdsToFieldMetadataDto = ({
  fieldMetadataDto,
  flatFieldMetadataOptionMaps,
}: {
  fieldMetadataDto: FieldMetadataDTO;
  flatFieldMetadataOptionMaps: Pick<
    FlatFieldMetadataOptionMaps,
    'byUniversalIdentifier'
  >;
}): FieldMetadataDTO => {
  if (!isDefined(fieldMetadataDto.options)) {
    return fieldMetadataDto;
  }

  return {
    ...fieldMetadataDto,
    options: fieldMetadataDto.options.map((option) => {
      const optionRow = isDefined(option.id)
        ? flatFieldMetadataOptionMaps.byUniversalIdentifier[option.id]
        : undefined;

      return isDefined(optionRow) &&
        optionRow.applicationId !== fieldMetadataDto.applicationId
        ? { ...option, applicationId: optionRow.applicationId }
        : option;
    }),
  } as FieldMetadataDTO;
};
