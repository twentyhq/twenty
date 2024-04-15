import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const linkCompositeType: CompositeType = {
  type: FieldMetadataType.LINK,
  properties: [
    {
      name: 'label',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'url',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type LinkMetadata = {
  label: string;
  url: string;
};
