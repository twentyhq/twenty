import { z } from 'zod';
import { RICH_TEXT_BLOCKNOTE_DEPRECATION_REASON } from '@/constants/RichTextBlocknoteDeprecationReason';
import { FieldMetadataType } from '../FieldMetadataType';
import { type CompositeType } from '../composite-types/composite-type.interface';

export const richTextCompositeType: CompositeType = {
  type: FieldMetadataType.RICH_TEXT,
  properties: [
    {
      name: 'blocknote',
      deprecationReason: RICH_TEXT_BLOCKNOTE_DEPRECATION_REASON,
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
    {
      name: 'tiptap',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'fileIds',
      type: FieldMetadataType.RAW_JSON,
      hidden: true,
      isRequired: false,
    },
  ],
};

export const richTextValueSchema = z.object({
  tiptap: z.string().nullable().optional(),
  markdown: z.string().nullable().optional(),
  blocknote: z.string().nullable().optional(),
});

export type RichTextMetadata = z.infer<typeof richTextValueSchema>;
