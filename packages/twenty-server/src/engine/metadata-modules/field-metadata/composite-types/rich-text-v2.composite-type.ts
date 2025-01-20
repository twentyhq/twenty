import { FieldMetadataType } from 'twenty-shared';
import { z } from 'zod';

import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

export const richTextV2CompositeType: CompositeType = {
  type: FieldMetadataType.RICH_TEXT_V2,
  properties: [
    {
      name: 'blocknote',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'markdown',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
  ],
};

export const richTextV2ValueSchema = z.object({
  blocknote: z.string().nullable(),
  markdown: z.string().nullable(),
});

export type RichTextV2Metadata = z.infer<typeof richTextV2ValueSchema>;
