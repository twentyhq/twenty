import { z } from 'zod';
import { FieldMetadataType } from '../FieldMetadataType';
import { type CompositeType } from '../composite-types/composite-type.interface';

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

// with import only markdown subfield is filled, then blocknote is undefined
export const richTextValueSchema = z.object({
  blocknote: z.string().nullable().optional(),
  markdown: z.string().nullable(),
});

export type RichTextMetadata = z.infer<typeof richTextValueSchema>;
