import { type Nullable } from '@/types';

export const checkIfFieldIsImageIdentifier = (
  fieldMetadataItem: {
    id: string;
    name: string;
  },
  objectMetadataItem: {
    nameSingular: string;
    imageIdentifierFieldMetadataId?: Nullable<string>;
  },
): boolean => {
  if (
    objectMetadataItem.nameSingular === 'company' &&
    fieldMetadataItem.name === 'domainName'
  ) {
    return true;
  }

  return (
    objectMetadataItem.imageIdentifierFieldMetadataId === fieldMetadataItem.id
  );
};
