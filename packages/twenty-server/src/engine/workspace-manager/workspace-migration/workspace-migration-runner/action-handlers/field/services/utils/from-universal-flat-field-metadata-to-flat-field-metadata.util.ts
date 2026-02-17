import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type ExtractUniversalForeignKeyAggregatorForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-flat-entity-foreign-key-aggregator-properties.constant';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { findFieldMetadataIdInCreateFieldContext } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/find-field-metadata-id-in-create-field-context.util';
import { fromUniversalSettingsToFlatFieldMetadataSettings } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/from-universal-settings-to-flat-field-metadata-settings.util';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

export type FromUniversalFlatFieldMetadataToFlatFieldMetadataArgs = {
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap: Map<string, string>;
  universalFlatFieldMetadata: Omit<
    UniversalFlatFieldMetadata,
    ExtractUniversalForeignKeyAggregatorForMetadataName<'fieldMetadata'>
  >;
  allFlatEntityMaps: AllFlatEntityMaps;
  context: Pick<
    WorkspaceMigrationActionRunnerArgs<AllUniversalWorkspaceMigrationAction>,
    'workspaceId' | 'flatApplication'
  >;
  objectMetadataId?: string;
};

export const fromUniversalFlatFieldMetadataToFlatFieldMetadata = ({
  universalFlatFieldMetadata,
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
  allFlatEntityMaps,
  objectMetadataId: optionalObjectMetadataId,
  context: {
    flatApplication: { id: applicationId },
    workspaceId,
  },
}: FromUniversalFlatFieldMetadataToFlatFieldMetadataArgs): FlatFieldMetadata => {
  const {
    universalIdentifier,
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
    universalSettings,
    ...restProperties
  } = universalFlatFieldMetadata;

  const generatedId =
    allFieldIdToBeCreatedInActionByUniversalIdentifierMap.get(
      universalIdentifier,
    );

  if (!isDefined(generatedId)) {
    throw new Error(
      `Generated ID not found for universal identifier: ${universalIdentifier}`,
    );
  }

  const objectMetadataId =
    optionalObjectMetadataId ??
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      objectMetadataUniversalIdentifier
    ]?.id ??
    null;

  if (!isDefined(objectMetadataId)) {
    throw new Error(
      `Object metadata not found for universal identifier: ${objectMetadataUniversalIdentifier}`,
    );
  }

  let relationTargetFieldMetadataId: string | null = null;

  if (isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    relationTargetFieldMetadataId = findFieldMetadataIdInCreateFieldContext({
      universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
      allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
      flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
    });

    if (!isDefined(relationTargetFieldMetadataId)) {
      throw new Error(
        `Relation target field metadata not found for universal identifier: ${relationTargetFieldMetadataUniversalIdentifier}`,
      );
    }
  }

  let relationTargetObjectMetadataId: string | null = null;

  if (isDefined(relationTargetObjectMetadataUniversalIdentifier)) {
    relationTargetObjectMetadataId =
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        relationTargetObjectMetadataUniversalIdentifier
      ]?.id ?? null;

    if (!isDefined(relationTargetObjectMetadataId)) {
      throw new Error(
        `Relation target object metadata not found for universal identifier: ${relationTargetObjectMetadataUniversalIdentifier}`,
      );
    }
  }

  const settings = fromUniversalSettingsToFlatFieldMetadataSettings({
    universalSettings,
    allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
    flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
  });

  const emptyUniversalForeignKeyAggregators =
    getUniversalFlatEntityEmptyForeignKeyAggregators({
      metadataName: 'fieldMetadata',
    });

  return {
    ...restProperties,
    settings,
    universalSettings,
    id: generatedId,
    workspaceId,
    applicationId,
    universalIdentifier,
    objectMetadataId,
    objectMetadataUniversalIdentifier,
    relationTargetFieldMetadataId,
    relationTargetFieldMetadataUniversalIdentifier:
      relationTargetFieldMetadataUniversalIdentifier ?? null,
    relationTargetObjectMetadataId,
    relationTargetObjectMetadataUniversalIdentifier:
      relationTargetObjectMetadataUniversalIdentifier ?? null,
    applicationUniversalIdentifier,
    // Empty aggregator arrays for newly created entities
    viewFieldIds: [],
    viewFilterIds: [],
    calendarViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    kanbanAggregateOperationViewIds: [],
    ...emptyUniversalForeignKeyAggregators,
  };
};
