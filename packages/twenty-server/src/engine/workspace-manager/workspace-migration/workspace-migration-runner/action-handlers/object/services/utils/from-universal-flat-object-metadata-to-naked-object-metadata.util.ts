import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

export type FromUniversalFlatObjectMetadataToNakedObjectMetadataArgs = {
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  generatedId: string;
  allFlatEntityMaps: AllFlatEntityMaps;
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap: Map<string, string>;
  context: Pick<
    WorkspaceMigrationActionRunnerArgs<WorkspaceMigrationAction>,
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

  const existingFieldId =
    flatFieldMetadataMaps.idByUniversalIdentifier[universalIdentifier];

  return existingFieldId ?? null;
};

export const fromUniversalFlatObjectMetadataToNakedObjectMetadata = ({
  universalFlatObjectMetadata,
  dataSourceId,
  generatedId,
  allFlatEntityMaps,
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
  context: {
    flatApplication: { id: applicationId },
    workspaceId,
  },
}: FromUniversalFlatObjectMetadataToNakedObjectMetadataArgs): FlatObjectMetadata & {
  dataSourceId: string;
} => {
  const {
    universalIdentifier,
    applicationUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
    imageIdentifierFieldMetadataUniversalIdentifier,
    viewUniversalIdentifiers: _viewUniversalIdentifiers,
    indexMetadataUniversalIdentifiers: _indexMetadataUniversalIdentifiers,
    fieldUniversalIdentifiers: _fieldUniversalIdentifiers,
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

  return {
    ...restProperties,
    dataSourceId,
    id: generatedId,
    workspaceId,
    applicationId,
    standardId: null,
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
    fieldUniversalIdentifiers: [],
    viewUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
  };
};
