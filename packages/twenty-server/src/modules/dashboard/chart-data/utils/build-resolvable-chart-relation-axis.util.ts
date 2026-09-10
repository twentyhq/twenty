import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ChartRelationLabelAxisInput } from 'src/modules/dashboard/chart-data/types/chart-relation-label-axis-input.type';
import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { type ResolvableChartRelationAxis } from 'src/modules/dashboard/chart-data/types/resolvable-chart-relation-axis.type';
import { getChartLabelIdentifierColumnNames } from 'src/modules/dashboard/chart-data/utils/get-chart-label-identifier-column-names.util';

export const buildResolvableChartRelationAxis = ({
  dimensionIndex,
  axis,
  rawResults,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  dimensionIndex: number;
  axis: ChartRelationLabelAxisInput;
  rawResults: GroupByRawResult[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ResolvableChartRelationAxis | undefined => {
  if (
    !isMorphOrRelationFlatFieldMetadata(axis.groupByField) ||
    isDefined(axis.subFieldName)
  ) {
    return undefined;
  }

  const targetObjectMetadataId =
    axis.groupByField.relationTargetObjectMetadataId;

  if (!isDefined(targetObjectMetadataId)) {
    return undefined;
  }

  const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: targetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(targetFlatObjectMetadata)) {
    return undefined;
  }

  const labelIdentifierColumnNames = getChartLabelIdentifierColumnNames({
    flatObjectMetadata: targetFlatObjectMetadata,
    flatFieldMetadataMaps,
  });

  if (!isDefined(labelIdentifierColumnNames)) {
    return undefined;
  }

  const recordIds = [
    ...new Set(
      rawResults
        .map((result) => result.groupByDimensionValues?.[dimensionIndex])
        .filter(isNonEmptyString),
    ),
  ];

  if (!isNonEmptyArray(recordIds)) {
    return undefined;
  }

  return {
    dimensionIndex,
    targetFlatObjectMetadata,
    labelIdentifierColumnNames,
    recordIds,
  };
};
