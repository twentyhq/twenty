import {
  getFieldMetadataFormulaExpression,
  isDefined,
} from 'twenty-shared/utils';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export const isFormulaFlatFieldMetadata = (
  flatFieldMetadata: Pick<OrmFlatFieldMetadata, 'settings'>,
): boolean => isDefined(getFieldMetadataFormulaExpression(flatFieldMetadata));
