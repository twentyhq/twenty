import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const fileCompositeType: CompositeType = {
  type: FieldMetadataType.FILE,
  properties: [
    {
      name: 'fileName',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: true,
    },
    {
      name: 'fileExtension',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: true,
    },
    {
      name: 'uploadedAt',
      type: FieldMetadataType.DATE_TIME,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'storageType',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type FileMetadata = {
  fileName: string;
  fileExtension: string;
  uploadedAt: Date;
  storageType: 'server' | 'gmail';
};
