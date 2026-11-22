import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFormulaFlatFieldMetadata } from 'src/engine/metadata-modules/formula-field/utils/is-formula-flat-field-metadata.util';

export const isFieldMetadataUIEditable = (
  fieldMetadata: Pick<FlatFieldMetadata, 'isUIEditable'> &
    Pick<OrmFlatFieldMetadata, 'settings'>,
): boolean =>
  fieldMetadata.isUIEditable && !isFormulaFlatFieldMetadata(fieldMetadata);
