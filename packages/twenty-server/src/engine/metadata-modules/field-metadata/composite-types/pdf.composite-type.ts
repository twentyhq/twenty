import { FieldMetadataType } from 'twenty-shared/types';

import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

export const pdfCompositeType: CompositeType = {
  type: FieldMetadataType.PDF,
  properties: [
    {
      name: 'attachmentIds',
      type: FieldMetadataType.RAW_JSON,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type PdfMetadata = {
  attachmentIds: string[] | null;
};
