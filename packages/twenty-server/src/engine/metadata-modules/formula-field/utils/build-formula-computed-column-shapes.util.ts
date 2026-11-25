import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getCompiledObjectFormulaFields } from 'src/engine/metadata-modules/formula-field/utils/compile-object-formula-fields.util';
import {
  type WorkspaceComputedColumnShape,
  type WorkspaceComputedLookupShape,
} from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export const buildFormulaComputedColumnShapes = (compilationInput: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  schemaName: string;
}): {
  computedColumnShapes: WorkspaceComputedColumnShape[];
  computedLookupShapes: WorkspaceComputedLookupShape[];
} => {
  const { formulaFields, lookupShapes } =
    getCompiledObjectFormulaFields(compilationInput);
  const computedColumnShapes = formulaFields
    .filter(({ isStored }) => !isStored)
    .flatMap(({ columns, dependencies }) =>
      columns.map(({ columnName, sqlType, expression }) => ({
        columnName,
        sqlType,
        expression,
        dependencies,
      })),
    );
  const readAliases = new Set(
    computedColumnShapes.flatMap(({ dependencies }) =>
      dependencies.map(({ alias }) => alias),
    ),
  );

  return {
    computedColumnShapes,
    computedLookupShapes: lookupShapes.filter(({ alias }) =>
      readAliases.has(alias),
    ),
  };
};
