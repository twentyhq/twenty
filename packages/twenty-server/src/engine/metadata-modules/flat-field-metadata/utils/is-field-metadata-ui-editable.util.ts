import { isFormulaFieldMetadata } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const isFieldMetadataUIEditable = ({
  isUIEditable,
  settings,
}: Pick<FlatFieldMetadata, 'isUIEditable'> & { settings?: unknown }): boolean =>
  isUIEditable && !isFormulaFieldMetadata({ settings });
