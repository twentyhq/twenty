import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { FieldMetadataType, isDefined } from 'twenty-shared';

import {
  RichTextV2Metadata,
  richTextV2ValueSchema,
} from 'src/engine/metadata-modules/field-metadata/composite-types/rich-text-v2.composite-type';

export const overrideFieldValue = async (
  fieldType: FieldMetadataType,
  value: any,
): Promise<any> => {
  if (!isDefined(value)) {
    return value;
  }

  switch (fieldType) {
    case FieldMetadataType.RICH_TEXT_V2:
      return overrideRichTextV2Value(value);
    default:
      return value;
  }
};

const overrideRichTextV2Value = async (
  richTextValue: any,
): Promise<RichTextV2Metadata> => {
  const parsedValue = richTextV2ValueSchema.parse(richTextValue);

  const serverBlockNoteEditor = ServerBlockNoteEditor.create();

  const convertedMarkdown = parsedValue.blocknote
    ? await serverBlockNoteEditor.blocksToMarkdownLossy(
        JSON.parse(parsedValue.blocknote),
      )
    : null;

  const convertedBlocknote = parsedValue.markdown
    ? JSON.stringify(
        await serverBlockNoteEditor.tryParseMarkdownToBlocks(
          parsedValue.markdown,
        ),
      )
    : null;

  return {
    markdown: parsedValue.markdown || convertedMarkdown,
    blocknote: parsedValue.blocknote || convertedBlocknote,
  };
};
