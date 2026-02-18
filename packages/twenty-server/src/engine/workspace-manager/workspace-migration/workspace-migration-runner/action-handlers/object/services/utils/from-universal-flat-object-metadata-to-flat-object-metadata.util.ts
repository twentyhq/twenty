import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ExtractUniversalForeignKeyAggregatorForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-flat-entity-foreign-key-aggregator-properties.constant';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

export type FromUniversalFlatObjectMetadataToFlatObjectMetadataArgs = {
  universalFlatObjectMetadata: Omit<
    UniversalFlatObjectMetadata,
    ExtractUniversalForeignKeyAggregatorForMetadataName<'objectMetadata'>
  >;
  generatedId: string;
  allFlatEntityMaps: AllFlatEntityMaps;
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap: Map<string, string>;
  context: Pick<
    WorkspaceMigrationActionRunnerArgs<AllUniversalWorkspaceMigrationAction>,
    'workspaceId' | 'flatApplication'
  >;
  dataSourceId: string;
};

const findFieldMetadataIdInCreateObjectContext = ({
  universalIdentifier,
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
  flatFieldMetadataMaps,
}: {
  universalIdentifier: string;
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap: Map<string, string>;
  flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
}): string | null => {
  const generatedId =
    allFieldIdToBeCreatedInActionByUniversalIdentifierMap.get(
      universalIdentifier,
    );

  if (isDefined(generatedId)) {
    return generatedId;
  }

  const existingField =
    flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier];

  return existingField?.id ?? null;
};

export const fromUniversalFlatObjectMetadataToFlatObjectMetadata = ({
  universalFlatObjectMetadata,
  dataSourceId,
  generatedId,
  allFlatEntityMaps,
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
  context: {
    flatApplication: { id: applicationId },
    workspaceId,
  },
}: FromUniversalFlatObjectMetadataToFlatObjectMetadataArgs): FlatObjectMetadata & {
  dataSourceId: string;
} => {
  const {
    universalIdentifier,
    applicationUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
    imageIdentifierFieldMetadataUniversalIdentifier,
    ...restProperties
  } = universalFlatObjectMetadata;

  let labelIdentifierFieldMetadataId: string | null = null;

  if (isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
    labelIdentifierFieldMetadataId = findFieldMetadataIdInCreateObjectContext({
      universalIdentifier: labelIdentifierFieldMetadataUniversalIdentifier,
      allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
      flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
    });

    if (!isDefined(labelIdentifierFieldMetadataId)) {
      throw new Error(
        `Label identifier field metadata not found for universal identifier: ${labelIdentifierFieldMetadataUniversalIdentifier}`,
      );
    }
  }

  let imageIdentifierFieldMetadataId: string | null = null;

  if (isDefined(imageIdentifierFieldMetadataUniversalIdentifier)) {
    imageIdentifierFieldMetadataId = findFieldMetadataIdInCreateObjectContext({
      universalIdentifier: imageIdentifierFieldMetadataUniversalIdentifier,
      allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
      flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
    });

    if (!isDefined(imageIdentifierFieldMetadataId)) {
      throw new Error(
        `Image identifier field metadata not found for universal identifier: ${imageIdentifierFieldMetadataUniversalIdentifier}`,
      );
    }
  }

  const emptyUniversalForeignKeyAggregators =
    getUniversalFlatEntityEmptyForeignKeyAggregators({
      metadataName: 'objectMetadata',
    });

  return {
    ...restProperties,
    dataSourceId,
    id: generatedId,
    workspaceId,
    applicationId,
    universalIdentifier,
    applicationUniversalIdentifier,
    labelIdentifierFieldMetadataId,
    labelIdentifierFieldMetadataUniversalIdentifier,
    targetTableName: 'DEPRECATED',
    imageIdentifierFieldMetadataId,
    imageIdentifierFieldMetadataUniversalIdentifier,
    // Empty aggregator arrays for newly created entities
    fieldIds: [],
    viewIds: [],
    indexMetadataIds: [],
    ...emptyUniversalForeignKeyAggregators,
  };
};
