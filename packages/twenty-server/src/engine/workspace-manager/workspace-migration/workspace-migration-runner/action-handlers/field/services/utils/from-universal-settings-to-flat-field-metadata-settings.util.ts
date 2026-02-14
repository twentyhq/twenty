import {
  type FieldMetadataSettings,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isUniversalFieldMetadataSettingsOftype } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { findFieldMetadataIdInCreateFieldContext } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/find-field-metadata-id-in-create-field-context.util';
import {
  WorkspaceMigrationActionExecutionException,
  WorkspaceMigrationActionExecutionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-action-execution.exception';

export const fromUniversalSettingsToFlatFieldMetadataSettings = ({
  universalSettings,
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
  flatFieldMetadataMaps,
}: {
  universalSettings: UniversalFlatFieldMetadata['universalSettings'];
  allFieldIdToBeCreatedInActionByUniversalIdentifierMap: Map<string, string>;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
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
