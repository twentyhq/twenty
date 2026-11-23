import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

const DOCUMENT_PROPERTY_NAMES = ['tiptap', 'blocknote'];

export const computeRichTextDocumentColumnNames = (
  fieldName: string,
): string[] =>
  (compositeTypeDefinitions.get(FieldMetadataType.RICH_TEXT)?.properties ?? [])
    .filter(({ name }) => DOCUMENT_PROPERTY_NAMES.includes(name))
    .map((property) => computeCompositeColumnName(fieldName, property));
