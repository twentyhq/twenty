import { isFormulaFieldMetadata } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const isFieldMetadataUIEditable = ({
  isUIEditable,
  formula,
}: Pick<FlatFieldMetadata, 'isUIEditable'> &
  Partial<Pick<FlatFieldMetadata, 'formula'>>): boolean =>
  isUIEditable && !isFormulaFieldMetadata({ formula });
