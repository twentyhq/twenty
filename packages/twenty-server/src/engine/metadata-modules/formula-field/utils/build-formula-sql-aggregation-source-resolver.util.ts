import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { findFlatFieldMetadataByName } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadata-by-name.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FormulaSqlAggregationSourceResolver } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-expression-to-sql.util';
import { resolveFormulaAggregatedRelation } from 'src/engine/metadata-modules/formula-field/utils/resolve-formula-aggregated-relation.util';
import { quoteTable } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const buildFormulaSqlAggregationSourceResolver = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  schemaName,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  schemaName: string;
}): FormulaSqlAggregationSourceResolver => {
  return (relationFieldName) => {
    const aggregatedRelation = resolveFormulaAggregatedRelation({
      relationFlatFieldMetadata: findFlatFieldMetadataByName({
        fieldName: relationFieldName,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      }),
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (!isDefined(aggregatedRelation)) {
      return undefined;
    }

    return {
      tableSql: quoteTable({
        schemaName,
        tableName: computeObjectTargetTable(
          aggregatedRelation.relatedFlatObjectMetadata,
        ),
      }),
      joinColumnName: aggregatedRelation.joinColumnName,
    };
  };
};
