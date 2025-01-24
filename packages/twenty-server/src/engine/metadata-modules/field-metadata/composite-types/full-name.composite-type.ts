import { FieldMetadataType } from 'twenty-shared';

import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

export const fullNameCompositeType: CompositeType = {
  type: FieldMetadataType.FULL_NAME,
  properties: [
    {
      name: 'firstName',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
      isIncludedInUniqueConstraint: true,
    },
    {
      name: 'lastName',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
      isIncludedInUniqueConstraint: true,
    },
  ],
};

export type FullNameMetadata = {
  firstName: string;
  lastName: string;
};
