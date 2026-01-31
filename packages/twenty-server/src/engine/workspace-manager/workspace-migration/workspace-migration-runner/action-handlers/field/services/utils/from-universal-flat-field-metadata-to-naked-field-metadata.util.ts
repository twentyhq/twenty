import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { findFieldMetadataIdInCreateFieldContext } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/find-field-metadata-id-in-create-field-context.util';
import { fromUniversalSettingsToInsertableSettings } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/from-universal-settings-to-naked-field-metadata-settings.util';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

export type FromUniversalFlatFieldMetadataToInsertableFieldMetadataArgs = {
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap: Map<string, string>;
  universalFlatFieldMetadata: UniversalFlatFieldMetadata;
  allFlatEntityMaps: AllFlatEntityMaps;
  context: Pick<
    WorkspaceMigrationActionRunnerArgs<WorkspaceMigrationAction>,
    'workspaceId' | 'flatApplication'
  >;
  objectMetadataId?: string;
};

const getIdFromUniversalIdentifier = (
  universalIdentifier: string,
  flatEntityMaps: { idByUniversalIdentifier: Partial<Record<string, string>> },
): string | null => {
  return flatEntityMaps.idByUniversalIdentifier[universalIdentifier] ?? null;
};

export const fromUniversalFlatFieldMetadataToNakedFieldMetadata = ({
  universalFlatFieldMetadata,
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
  allFlatEntityMaps,
  objectMetadataId: optionalObjectMetadataId,
  context: {
    flatApplication: { id: applicationId },
    workspaceId,
  },
}: FromUniversalFlatFieldMetadataToInsertableFieldMetadataArgs): FlatFieldMetadata => {
  const {
    universalIdentifier,
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
    viewFilterUniversalIdentifiers: _viewFilterUniversalIdentifiers,
    viewFieldUniversalIdentifiers: _viewFieldUniversalIdentifiers,
    kanbanAggregateOperationViewUniversalIdentifiers:
      _kanbanAggregateOperationViewUniversalIdentifiers,
    calendarViewUniversalIdentifiers: _calendarViewUniversalIdentifiers,
    mainGroupByFieldMetadataViewUniversalIdentifiers:
      _mainGroupByFieldMetadataViewUniversalIdentifiers,
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
    getIdFromUniversalIdentifier(
      objectMetadataUniversalIdentifier,
      allFlatEntityMaps.flatObjectMetadataMaps,
    );

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
    relationTargetObjectMetadataId = getIdFromUniversalIdentifier(
      relationTargetObjectMetadataUniversalIdentifier,
      allFlatEntityMaps.flatObjectMetadataMaps,
    );

    if (!isDefined(relationTargetObjectMetadataId)) {
      throw new Error(
        `Relation target object metadata not found for universal identifier: ${relationTargetObjectMetadataUniversalIdentifier}`,
      );
    }
  }

  const settings = fromUniversalSettingsToInsertableSettings({
    universalSettings,
    allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
    flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
  });

  return {
    ...restProperties,
    settings,
    universalSettings,
    id: generatedId,
    workspaceId,
    applicationId,
    standardId: null,
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
    viewFieldUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
  };
};
