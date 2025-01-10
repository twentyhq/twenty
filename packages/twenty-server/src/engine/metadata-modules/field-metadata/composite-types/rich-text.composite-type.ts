import { z } from 'zod';

import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const richTextCompositeType: CompositeType = {
  type: FieldMetadataType.RICH_TEXT,
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

export const richTextValueSchema = z.object({
  blocknote: z.string().nullable(),
  markdown: z.string().nullable(),
});

export type RichTextMetadata = z.infer<typeof richTextValueSchema>;
