import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type FromUniversalFlatFieldMetadataToInsertableFieldMetadataArgs = {
  universalFlatFieldMetadata: UniversalFlatFieldMetadata;
  universalIdentifierToGeneratedIdMap: Map<string, string>;
  allFlatEntityMaps: AllFlatEntityMaps;
  workspaceId: string;
};

const getIdFromUniversalIdentifier = (
  universalIdentifier: string,
  flatEntityMaps: { idByUniversalIdentifier: Partial<Record<string, string>> },
): string | null => {
  return flatEntityMaps.idByUniversalIdentifier[universalIdentifier] ?? null;
};

export const fromUniversalFlatFieldMetadataToInsertableFieldMetadata = ({
  universalFlatFieldMetadata,
  universalIdentifierToGeneratedIdMap,
  allFlatEntityMaps,
  workspaceId,
}: FromUniversalFlatFieldMetadataToInsertableFieldMetadataArgs) => {
  const {
    universalIdentifier,
    applicationUniversalIdentifier,
    objectUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
    // Universal properties to exclude from insert
    viewFilterUniversalIdentifiers: _viewFilterUniversalIdentifiers,
    viewFieldUniversalIdentifiers: _viewFieldUniversalIdentifiers,
    kanbanAggregateOperationViewUniversalIdentifiers:
      _kanbanAggregateOperationViewUniversalIdentifiers,
    calendarViewUniversalIdentifiers: _calendarViewUniversalIdentifiers,
    mainGroupByFieldMetadataViewUniversalIdentifiers:
      _mainGroupByFieldMetadataViewUniversalIdentifiers,
    universalSettings: _universalSettings,
    // Keep rest of properties
    ...restProperties
  } = universalFlatFieldMetadata;

  const generatedId =
    universalIdentifierToGeneratedIdMap.get(universalIdentifier);

  if (!isDefined(generatedId)) {
    throw new Error(
      `Generated ID not found for universal identifier: ${universalIdentifier}`,
    );
  }

  const objectMetadataId = getIdFromUniversalIdentifier(
    objectUniversalIdentifier,
    allFlatEntityMaps.flatObjectMetadataMaps,
  );

  if (!isDefined(objectMetadataId)) {
    throw new Error(
      `Object metadata not found for universal identifier: ${objectUniversalIdentifier}`,
    );
  }

  const applicationId = getIdFromUniversalIdentifier(
    applicationUniversalIdentifier,
    allFlatEntityMaps.flatApplicationMaps,
  );

  if (!isDefined(applicationId)) {
    throw new Error(
      `Application not found for universal identifier: ${applicationUniversalIdentifier}`,
    );
  }

  let relationTargetFieldMetadataId: string | null = null;

  if (isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    // First check if it's a field being created in the same action
    relationTargetFieldMetadataId =
      universalIdentifierToGeneratedIdMap.get(
        relationTargetFieldMetadataUniversalIdentifier,
      ) ?? null;

    // If not found in the map, check existing fields
    if (!isDefined(relationTargetFieldMetadataId)) {
      relationTargetFieldMetadataId = getIdFromUniversalIdentifier(
        relationTargetFieldMetadataUniversalIdentifier,
        allFlatEntityMaps.flatFieldMetadataMaps,
      );
    }

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

  return {
    ...restProperties,
    id: generatedId,
    workspaceId,
    applicationId,
    standardId: null,
    universalIdentifier,
    objectMetadataId,
    relationTargetFieldMetadataId,
    relationTargetObjectMetadataId,
  };
};
