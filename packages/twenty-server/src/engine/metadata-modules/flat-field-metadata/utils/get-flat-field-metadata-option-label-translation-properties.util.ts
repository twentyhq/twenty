import {
  type FieldOptionLabelTranslationProperty,
  getFieldOptionLabelTranslationProperty,
} from 'twenty-shared/i18n';
import {
  type FieldMetadataDefaultOption,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined, isFieldMetadataSelectKind } from 'twenty-shared/utils';

export const getFlatFieldMetadataOptionLabelTranslationProperties = ({
  type,
  options,
}: {
  type: FieldMetadataType;
  options: Pick<FieldMetadataDefaultOption, 'id'>[] | null | undefined;
}): FieldOptionLabelTranslationProperty[] =>
  isFieldMetadataSelectKind(type)
    ? (options ?? [])
        .map(({ id }) => id)
        .filter(isDefined)
        .map(getFieldOptionLabelTranslationProperty)
    : [];
