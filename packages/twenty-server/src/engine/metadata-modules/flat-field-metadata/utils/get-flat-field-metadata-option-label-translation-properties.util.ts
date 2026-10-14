import {
  FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN,
  listTranslatablePropertyPathValues,
} from 'twenty-shared/i18n';
import {
  type FieldMetadataDefaultOption,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isFieldMetadataSelectKind } from 'twenty-shared/utils';

export const getFlatFieldMetadataOptionLabelTranslationProperties = ({
  type,
  options,
}: {
  type: FieldMetadataType;
  options:
    | Pick<FieldMetadataDefaultOption, 'id' | 'label'>[]
    | null
    | undefined;
}): string[] =>
  isFieldMetadataSelectKind(type)
    ? listTranslatablePropertyPathValues({
        pattern: FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN,
        value: { options },
      }).map(({ property }) => property)
    : [];
