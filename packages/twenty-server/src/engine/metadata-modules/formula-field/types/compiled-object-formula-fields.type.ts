import { type CompiledFormulaField } from 'src/engine/metadata-modules/formula-field/types/compiled-formula-field.type';
import { type WorkspaceComputedLookupShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export type CompiledObjectFormulaFields = {
  formulaFields: CompiledFormulaField[];
  lookupShapes: WorkspaceComputedLookupShape[];
};
