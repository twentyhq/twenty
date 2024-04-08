import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const fullNameCompositeType: CompositeType = {
  type: FieldMetadataType.FULL_NAME,
  properties: [
    {
      name: 'firstName',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'lastName',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type FullNameMetadata = {
  firstName: string;
  lastName: string;
};
