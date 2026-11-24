import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FormulaSqlAggregationSourceResolver } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-expression-to-sql.util';
import { resolveFormulaAggregatedRelation } from 'src/engine/metadata-modules/formula-field/utils/resolve-formula-aggregated-relation.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

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
  const flatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  return (relationFieldName) => {
    const aggregatedRelation = resolveFormulaAggregatedRelation({
      relationFlatFieldMetadata: flatFieldMetadatas.find(
        ({ name }) => name === relationFieldName,
      ),
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (!isDefined(aggregatedRelation)) {
      return undefined;
    }

    return {
      tableSql: `${escapeIdentifier(schemaName)}.${escapeIdentifier(
        computeObjectTargetTable(aggregatedRelation.relatedFlatObjectMetadata),
      )}`,
      joinColumnName: aggregatedRelation.joinColumnName,
    };
  };
};
