import {
  getFieldMetadataFormulaEvaluation,
  isDefined,
  isFormulaFieldMetadata,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { buildFormulaFieldDescriptorsFromFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-flat-entity-maps.util';
import { buildFormulaSqlAggregationSourceResolver } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-aggregation-source-resolver.util';
import { buildFormulaSqlReferenceResolverFromDescriptors } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-reference-resolver-from-descriptors.util';
import { type CompiledFormulaField } from 'src/engine/metadata-modules/formula-field/types/compiled-formula-field.type';
import { type CompiledObjectFormulaFields } from 'src/engine/metadata-modules/formula-field/types/compiled-object-formula-fields.type';
import { compileFormulaFieldColumns } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-columns.util';
import { createFormulaLookupAliasAllocator } from 'src/engine/metadata-modules/formula-field/utils/create-formula-lookup-alias-allocator.util';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

type CompileObjectFormulaFieldsArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  schemaName: string;
};

const compileObjectFormulaFields = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  schemaName,
}: CompileObjectFormulaFieldsArgs): CompiledObjectFormulaFields => {
  const formulaFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  ).filter(isFormulaFieldMetadata);

  if (formulaFlatFieldMetadatas.length === 0) {
    return { formulaFields: [], lookupShapes: [] };
  }

  const tableName = computeObjectTargetTable(flatObjectMetadata);
  const fields = buildFormulaFieldDescriptorsFromFlatEntityMaps({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });
  const { getLookupAlias, getLookupShapes } =
    createFormulaLookupAliasAllocator();
  const resolveAggregationSource = buildFormulaSqlAggregationSourceResolver({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    schemaName,
  });

  const formulaFields = formulaFlatFieldMetadatas.map(
    (flatFieldMetadata): CompiledFormulaField => {
      const dependencyByKey = new Map<
        string,
        CompiledFormulaField['dependencies'][number]
      >();
      const addDependency = ({
        alias,
        fieldUniversalIdentifier = '',
      }: {
        alias: string;
        fieldUniversalIdentifier?: string;
      }) => {
        const fieldMetadataId =
          flatFieldMetadataMaps.byUniversalIdentifier[fieldUniversalIdentifier]
            ?.id;

        if (isDefined(fieldMetadataId)) {
          dependencyByKey.set(`${alias}.${fieldMetadataId}`, {
            alias,
            fieldMetadataId,
          });
        }
      };

      const columns =
        compileFormulaFieldColumns({
          flatFieldMetadata,
          fields,
          schemaName,
          tableName,
          resolveReference: buildFormulaSqlReferenceResolverFromDescriptors({
            fields,
            getLookupAlias,
            onFieldRead: addDependency,
          }),
          // count() reads no field of the related records, so the relation is recorded here
          resolveAggregationSource: (relationFieldName) => {
            const aggregationSource =
              resolveAggregationSource(relationFieldName);

            if (isDefined(aggregationSource)) {
              addDependency({
                alias: COMPUTED_COLUMN_RECORD_ALIAS,
                fieldUniversalIdentifier: fields.find(
                  ({ name }) => name === relationFieldName,
                )?.universalIdentifier,
              });
            }

            return aggregationSource;
          },
        }) ?? [];

      return {
        flatFieldMetadata,
        isStored:
          getFieldMetadataFormulaEvaluation({
            settings: flatFieldMetadata.settings,
          }) === 'STORED',
        columns,
        dependencies: [...dependencyByKey.values()],
      };
    },
  );

  return { formulaFields, lookupShapes: getLookupShapes() };
};

const compilationCache = new WeakMap<
  FlatEntityMaps<OrmFlatFieldMetadata>,
  WeakMap<
    FlatEntityMaps<FlatObjectMetadata>,
    Map<string, CompiledObjectFormulaFields>
  >
>();

// The cached maps keep their identity until the metadata changes, and belong to one workspace, so to one schema
export const getCompiledObjectFormulaFields = (
  args: CompileObjectFormulaFieldsArgs,
): CompiledObjectFormulaFields => {
  const cacheByFlatObjectMetadataMaps =
    compilationCache.get(args.flatFieldMetadataMaps) ?? new WeakMap();
  const cache =
    cacheByFlatObjectMetadataMaps.get(args.flatObjectMetadataMaps) ??
    new Map<string, CompiledObjectFormulaFields>();
  const compilation =
    cache.get(args.flatObjectMetadata.id) ?? compileObjectFormulaFields(args);

  cache.set(args.flatObjectMetadata.id, compilation);
  cacheByFlatObjectMetadataMaps.set(args.flatObjectMetadataMaps, cache);
  compilationCache.set(
    args.flatFieldMetadataMaps,
    cacheByFlatObjectMetadataMaps,
  );

  return compilation;
};
