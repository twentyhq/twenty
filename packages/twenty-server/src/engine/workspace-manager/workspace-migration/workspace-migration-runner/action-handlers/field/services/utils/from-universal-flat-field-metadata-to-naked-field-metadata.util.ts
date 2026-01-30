import {
  type FieldMetadataSettings,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isUniversalFieldMetadataSettingsOftype } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { type NakedFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-all-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import {
  WorkspaceMigrationActionExecutionException,
  WorkspaceMigrationActionExecutionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-action-execution.exception';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

export type FromUniversalFlatFieldMetadataToInsertableFieldMetadataArgs = {
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap: Map<string, string>;
  universalFlatFieldMetadata: UniversalFlatFieldMetadata;
  allFlatEntityMaps: UniversalAllFlatEntityMaps;
  context: Pick<
    WorkspaceMigrationActionRunnerArgs<WorkspaceMigrationAction>,
    'workspaceId' | 'flatApplication'
  >;
};

const getIdFromUniversalIdentifier = (
  universalIdentifier: string,
  flatEntityMaps: { idByUniversalIdentifier: Partial<Record<string, string>> },
): string | null => {
  return flatEntityMaps.idByUniversalIdentifier[universalIdentifier] ?? null;
};

const findFieldMetadataIdInCreateFieldContext = ({
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

const fromUniversalSettingsToInsertableSettings = ({
  universalSettings,
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
  flatFieldMetadataMaps,
}: {
  universalSettings: UniversalFlatFieldMetadata['universalSettings'];
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap: Map<string, string>;
  flatFieldMetadataMaps: UniversalAllFlatEntityMaps['flatFieldMetadataMaps'];
}): FieldMetadataSettings => {
  if (!isDefined(universalSettings)) {
    return null;
  }

  if (
    isUniversalFieldMetadataSettingsOftype(
      universalSettings,
      FieldMetadataType.RELATION,
    ) ||
    isUniversalFieldMetadataSettingsOftype(
      universalSettings,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    const { junctionTargetFieldUniversalIdentifier, ...rest } =
      universalSettings;
    const junctionTargetFieldId = isDefined(
      junctionTargetFieldUniversalIdentifier,
    )
      ? (findFieldMetadataIdInCreateFieldContext({
          universalIdentifier: junctionTargetFieldUniversalIdentifier,
          allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
          flatFieldMetadataMaps,
        }) ?? undefined)
      : undefined;

    if (
      isDefined(junctionTargetFieldUniversalIdentifier) &&
      !isDefined(junctionTargetFieldId)
    ) {
      throw new WorkspaceMigrationActionExecutionException({
        code: WorkspaceMigrationActionExecutionExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: `Could not not find junction column id for universal identifier ${junctionTargetFieldUniversalIdentifier}`,
      });
    }

    return {
      ...rest,
      junctionTargetFieldId,
    };
  }

  return universalSettings;
};

export const fromUniversalFlatFieldMetadataToNakedFieldMetadata = ({
  universalFlatFieldMetadata,
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
  allFlatEntityMaps,
  context: {
    flatApplication: { id: applicationId },
    workspaceId,
  },
  // TODO create better typing rather than omitting lets create module that extends each others
}: FromUniversalFlatFieldMetadataToInsertableFieldMetadataArgs): NakedFlatEntity<FieldMetadataEntity> => {
  const {
    universalIdentifier,
    applicationUniversalIdentifier: _applicationUniversalIdentifier,
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

  const objectMetadataId = getIdFromUniversalIdentifier(
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
