import { FieldMetadataType } from 'twenty-shared/types';

import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

export const imageCompositeType: CompositeType = {
  type: FieldMetadataType.IMAGE,
  properties: [
    {
      name: 'attachmentIds',
      type: FieldMetadataType.RAW_JSON,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'fullPaths',
      type: FieldMetadataType.RAW_JSON,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'names',
      type: FieldMetadataType.RAW_JSON,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'types',
      type: FieldMetadataType.RAW_JSON,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type ImageMetadata = {
  attachmentIds: string[] | null;
  fullPaths: string[] | null;
  names: string[] | null;
  types: string[] | null;
};
