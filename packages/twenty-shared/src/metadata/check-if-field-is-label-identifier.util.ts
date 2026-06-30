import { type Nullable } from '@/types';
import { isDefined } from '@/utils';

export const DEFAULT_LABEL_IDENTIFIER_FIELD_NAME = 'name';

export const checkIfFieldIsLabelIdentifier = (
  fieldMetadataItem: { id: string; name: string },
  objectMetadataItem: { labelIdentifierFieldMetadataId?: Nullable<string> },
): boolean => {
  return isDefined(objectMetadataItem.labelIdentifierFieldMetadataId)
    ? fieldMetadataItem.id === objectMetadataItem.labelIdentifierFieldMetadataId
    : fieldMetadataItem.name === DEFAULT_LABEL_IDENTIFIER_FIELD_NAME;
};
