import { FieldMetadataType } from 'twenty-shared/types';
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

// with import only markdown subfield is filled, then blocknote is undefined
export const richTextV2ValueSchema = z.object({
  blocknote: z.string().nullable().optional(),
  markdown: z.string().nullable(),
});

export type RichTextV2Metadata = z.infer<typeof richTextV2ValueSchema>;
