import { type FormulaFieldDependency } from 'src/engine/metadata-modules/formula-field/types/formula-field-dependency.type';

export type FormulaFieldLookup = {
  relationFieldName: string;
  targetObjectMetadataId: string;
  targetFields: FormulaFieldDependency[];
};
