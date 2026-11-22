import {
  compileFormulaExpression,
  createFormulaEvaluator,
  getFieldMetadataFormulaExpression,
  isDefined,
  isFormulaFieldMetadataType,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FormulaFieldEvaluationPlan } from 'src/engine/metadata-modules/formula-field/types/formula-field-evaluation-plan.type';
import { type FormulaFieldLookup } from 'src/engine/metadata-modules/formula-field/types/formula-field-lookup.type';
import { buildFormulaFieldDescriptorsFromFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-flat-entity-maps.util';
import { getFieldMetadataIdToColumnNamesMap } from 'src/engine/twenty-orm/utils/get-field-metadata-id-to-column-names-map.util';

type BuildFormulaFieldEvaluationPlansArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
};

const buildLookup = ({
  relationFlatFieldMetadata,
  targetFieldNames,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  relationFlatFieldMetadata: OrmFlatFieldMetadata;
  targetFieldNames: string[];
} & Pick<
  BuildFormulaFieldEvaluationPlansArgs,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>): FormulaFieldLookup | undefined => {
  const targetFlatObjectMetadata = isDefined(
    relationFlatFieldMetadata.relationTargetObjectMetadataId,
  )
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationFlatFieldMetadata.relationTargetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      })
    : undefined;

  if (!isDefined(targetFlatObjectMetadata)) {
    return undefined;
  }

  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    targetFlatObjectMetadata,
  );
  const columnNamesByFieldMetadataId = getFieldMetadataIdToColumnNamesMap(
    targetFlatObjectMetadata,
    flatFieldMetadataMaps,
  );
  const targetFieldMetadataIds = targetFieldNames
    .map((targetFieldName) => fieldIdByName[targetFieldName])
    .filter(isDefined);

  return {
    relationFieldName: relationFlatFieldMetadata.name,
    relationFieldMetadataId: relationFlatFieldMetadata.id,
    targetObjectMetadataId: targetFlatObjectMetadata.id,
    targetFieldMetadataIds,
    targetFieldNames,
    targetColumnNames: targetFieldMetadataIds.flatMap(
      (targetFieldMetadataId) =>
        columnNamesByFieldMetadataId.get(targetFieldMetadataId) ?? [],
    ),
  };
};

export const buildFormulaFieldEvaluationPlans = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: BuildFormulaFieldEvaluationPlansArgs): FormulaFieldEvaluationPlan[] => {
  const flatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );
  const hasFormulaField = flatFieldMetadatas.some((flatFieldMetadata) =>
    isDefined(getFieldMetadataFormulaExpression(flatFieldMetadata)),
  );

  if (!hasFormulaField) {
    return [];
  }

  const fields = buildFormulaFieldDescriptorsFromFlatEntityMaps({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });
  const flatFieldMetadataByName = new Map(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.name,
      flatFieldMetadata,
    ]),
  );
  const columnNamesByFieldMetadataId = getFieldMetadataIdToColumnNamesMap(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  return flatFieldMetadatas.flatMap((flatFieldMetadata) => {
    const expression = getFieldMetadataFormulaExpression(flatFieldMetadata);

    if (
      !isDefined(expression) ||
      !isFormulaFieldMetadataType(flatFieldMetadata.type)
    ) {
      return [];
    }

    const compilation = compileFormulaExpression({ expression, fields });

    if (!compilation.isValid) {
      return [
        {
          fieldName: flatFieldMetadata.name,
          ownFieldMetadataIds: [],
          ownFieldNames: [],
          ownColumnNames: [],
          lookups: [],
          evaluate: () => null,
        },
      ];
    }

    const paths = Object.keys(compilation.bindings);
    const ownFlatFieldMetadatas = paths
      .filter((path) => !path.includes('.'))
      .map((ownFieldName) => flatFieldMetadataByName.get(ownFieldName))
      .filter(isDefined);
    return [
      {
        fieldName: flatFieldMetadata.name,
        ownFieldMetadataIds: ownFlatFieldMetadatas.map(({ id }) => id),
        ownFieldNames: ownFlatFieldMetadatas.map(({ name }) => name),
        ownColumnNames: ownFlatFieldMetadatas.flatMap(
          ({ id }) => columnNamesByFieldMetadataId.get(id) ?? [],
        ),
        lookups: ownFlatFieldMetadatas
          .filter(({ relationTargetObjectMetadataId }) =>
            isDefined(relationTargetObjectMetadataId),
          )
          .map((relationFlatFieldMetadata) =>
            buildLookup({
              relationFlatFieldMetadata,
              targetFieldNames: paths
                .filter((path) =>
                  path.startsWith(`${relationFlatFieldMetadata.name}.`),
                )
                .map((path) =>
                  path.slice(relationFlatFieldMetadata.name.length + 1),
                ),
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
            }),
          )
          .filter(isDefined),
        evaluate: createFormulaEvaluator({
          expression,
          fields,
          fieldMetadataType: flatFieldMetadata.type,
        }),
      },
    ];
  });
};
