import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  normalizeViewFieldLabel,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_VIEW_FIELD_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-field/constants/flat-view-field-editable-properties.constant';
import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { fromViewFieldOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-overrides-to-universal-overrides.util';
import { fromViewFieldRelationScopeToUniversalRelationScope } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-relation-scope-to-universal-relation-scope.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/overrides/utils/sanitize-overridable-entity-input.util';
import { type UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow = ({
  updateViewFieldInput: rawUpdateViewFieldInput,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  flatFieldMetadataMaps,
  callerApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  updateViewFieldInput: UpdateViewFieldInput;
  flatViewFieldMaps: FlatViewFieldMaps;
  callerApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
} & Pick<
  AllFlatEntityMaps,
  'flatViewFieldGroupMaps' | 'flatFieldMetadataMaps'
>): UniversalFlatViewField => {
  const { id: viewFieldToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewFieldInput,
      ['id'],
    );

  const existingFlatViewFieldToUpdate = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewFieldToUpdateId,
    flatEntityMaps: flatViewFieldMaps,
  });

  if (!isDefined(existingFlatViewFieldToUpdate)) {
    throw new ViewFieldException(
      t`View field to update not found`,
      ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
    );
  }

  const sanitizedEditableProperties = extractAndSanitizeObjectStringFields(
    rawUpdateViewFieldInput.update,
    FLAT_VIEW_FIELD_EDITABLE_PROPERTIES,
  );

  const editableProperties = !isDefined(sanitizedEditableProperties.label)
    ? sanitizedEditableProperties
    : {
        ...sanitizedEditableProperties,
        label: normalizeViewFieldLabel(sanitizedEditableProperties.label),
      };

  const shouldOverride = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      existingFlatViewFieldToUpdate.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    isSystemSideEffect: existingFlatViewFieldToUpdate.isSystemSideEffect,
  });

  const { overrides, updatedEditableProperties } =
    sanitizeOverridableEntityInput({
      metadataName: 'viewField',
      existingFlatEntity: existingFlatViewFieldToUpdate,
      updatedEditableProperties: editableProperties,
      shouldOverride,
      callerApplicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    });

  const mergedRecord = mergeUpdateInExistingRecord({
    existing: existingFlatViewFieldToUpdate,
    properties: [...FLAT_VIEW_FIELD_EDITABLE_PROPERTIES],
    update: updatedEditableProperties,
  });

  const flatViewFieldToUpdate = {
    ...mergedRecord,
    overrides,
  } as UniversalFlatViewField;

  const {
    viewFieldGroupUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
  } = resolveEntityRelationUniversalIdentifiers({
    metadataName: 'viewField',
    foreignKeyValues: {
      viewFieldGroupId: mergedRecord.viewFieldGroupId,
      relationTargetFieldMetadataId: mergedRecord.relationTargetFieldMetadataId,
    },
    flatEntityMaps: { flatViewFieldGroupMaps, flatFieldMetadataMaps },
  });

  flatViewFieldToUpdate.viewFieldGroupUniversalIdentifier =
    viewFieldGroupUniversalIdentifier;
  flatViewFieldToUpdate.relationTargetFieldMetadataUniversalIdentifier =
    relationTargetFieldMetadataUniversalIdentifier;

  if (isDefined(mergedRecord.relationScope)) {
    flatViewFieldToUpdate.universalRelationScope =
      fromViewFieldRelationScopeToUniversalRelationScope({
        relationScope: mergedRecord.relationScope,
        fieldMetadataUniversalIdentifierById:
          flatFieldMetadataMaps.universalIdentifierById,
      });
  } else {
    flatViewFieldToUpdate.universalRelationScope = null;
  }

  if (isDefined(overrides)) {
    flatViewFieldToUpdate.universalOverrides =
      fromViewFieldOverridesToUniversalOverrides({
        overrides,
        viewFieldGroupUniversalIdentifierById:
          flatViewFieldGroupMaps.universalIdentifierById,
      });
  } else {
    flatViewFieldToUpdate.universalOverrides = null;
  }

  return flatViewFieldToUpdate;
};
