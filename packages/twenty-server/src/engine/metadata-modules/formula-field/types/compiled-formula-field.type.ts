import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type CompiledFormulaFieldColumn } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-columns.util';
import { type WorkspaceComputedColumnShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export type CompiledFormulaField = {
  flatFieldMetadata: OrmFlatFieldMetadata;
  isStored: boolean;
  columns: CompiledFormulaFieldColumn[];
  // Every field read, under the alias it is read through: the record, a lookup or an aggregate
  dependencies: WorkspaceComputedColumnShape['dependencies'];
};
