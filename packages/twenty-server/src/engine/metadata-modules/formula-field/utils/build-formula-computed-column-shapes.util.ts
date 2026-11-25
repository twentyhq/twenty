import {
  isDefined,
  isQueryTimeFormulaFieldMetadata,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { buildFormulaFieldDescriptorsFromFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-flat-entity-maps.util';
import { buildFormulaSqlReferenceResolverFromDescriptors } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-reference-resolver-from-descriptors.util';
import { createFormulaLookupAliasAllocator } from 'src/engine/metadata-modules/formula-field/utils/create-formula-lookup-alias-allocator.util';
import { compileFormulaFieldColumns } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-columns.util';
import {
  type WorkspaceComputedColumnShape,
  type WorkspaceComputedLookupShape,
} from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export const buildFormulaComputedColumnShapes = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  schemaName,
  tableName,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  schemaName: string;
  tableName: string;
}): {
  computedColumnShapes: WorkspaceComputedColumnShape[];
  computedLookupShapes: WorkspaceComputedLookupShape[];
} => {
  const formulaFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  ).filter(isQueryTimeFormulaFieldMetadata);

  if (formulaFlatFieldMetadatas.length === 0) {
    return { computedColumnShapes: [], computedLookupShapes: [] };
  }

  const fields = buildFormulaFieldDescriptorsFromFlatEntityMaps({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });
  const { getLookupAlias, getLookupShapes } =
    createFormulaLookupAliasAllocator();

  const computedColumnShapes = formulaFlatFieldMetadatas.flatMap(
    (formulaFlatFieldMetadata): WorkspaceComputedColumnShape[] => {
      const dependencyByKey = new Map<
        string,
        WorkspaceComputedColumnShape['dependencies'][number]
      >();
      const compiledColumns = compileFormulaFieldColumns({
        flatFieldMetadata: formulaFlatFieldMetadata,
        schemaName,
        tableName,
        resolveReference: buildFormulaSqlReferenceResolverFromDescriptors({
          fields,
          getLookupAlias,
          onFieldRead: ({ alias, fieldUniversalIdentifier }) => {
            const fieldMetadataId =
              flatFieldMetadataMaps.byUniversalIdentifier[
                fieldUniversalIdentifier
              ]?.id;

            if (isDefined(fieldMetadataId)) {
              dependencyByKey.set(`${alias}.${fieldMetadataId}`, {
                alias,
                fieldMetadataId,
              });
            }
          },
        }),
      });

      return (compiledColumns ?? []).map(
        ({ columnName, sqlType, expression }) => ({
          columnName,
          sqlType,
          expression,
          dependencies: [...dependencyByKey.values()],
        }),
      );
    },
  );

  return {
    computedColumnShapes,
    computedLookupShapes: getLookupShapes(),
  };
};
