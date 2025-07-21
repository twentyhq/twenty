import { FieldMetadataType } from 'twenty-shared/types';

import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

export const fullNameCompositeType: CompositeType = {
  type: FieldMetadataType.FULL_NAME,
  properties: [
    {
      name: 'firstName',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
      isIncludedInUniqueConstraint: false,
    },
    {
      name: 'lastName',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
      isIncludedInUniqueConstraint: false,
    },
  ],
};

export type FullNameMetadata = {
  firstName: string;
  lastName: string;
};
