import { isDefined } from 'twenty-shared/utils';

import { type NakedFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type UniversalAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-all-flat-entity-maps.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

export type FromUniversalFlatObjectMetadataToNakedObjectMetadataArgs = {
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  generatedId: string;
  allFlatEntityMaps: UniversalAllFlatEntityMaps;
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
  flatFieldMetadataMaps: UniversalAllFlatEntityMaps['flatFieldMetadataMaps'];
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
}: FromUniversalFlatObjectMetadataToNakedObjectMetadataArgs): NakedFlatEntity<ObjectMetadataEntity> => {
  const {
    universalIdentifier,
    applicationUniversalIdentifier: _applicationUniversalIdentifier,
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
    labelIdentifierFieldMetadataId,
    targetTableName: 'DEPRECATED',
    imageIdentifierFieldMetadataId,
  };
};
