import { msg, t } from '@lingui/core/macro';

import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

// The relation target is not overridable: a change from another application would land on
// the owner's column and be undone by the owner's next sync, so it is rejected instead.
export const validateFlatViewFieldRelationTargetNotOverridden = ({
  existingFlatViewField,
  updatedFlatViewField,
  buildOptions,
}: {
  existingFlatViewField: Pick<
    UniversalFlatViewField,
    | 'applicationUniversalIdentifier'
    | 'isSystemSideEffect'
    | 'relationTargetFieldMetadataUniversalIdentifier'
  >;
  updatedFlatViewField: Pick<
    UniversalFlatViewField,
    'relationTargetFieldMetadataUniversalIdentifier'
  >;
  buildOptions: Pick<
    WorkspaceMigrationValidationBuildOptions,
    | 'applicationUniversalIdentifier'
    | 'workspaceCustomApplicationUniversalIdentifier'
  >;
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (
    existingFlatViewField.relationTargetFieldMetadataUniversalIdentifier ===
    updatedFlatViewField.relationTargetFieldMetadataUniversalIdentifier
  ) {
    return [];
  }

  const isCallerOverridingViewField = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier:
      buildOptions.applicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      existingFlatViewField.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier:
      buildOptions.workspaceCustomApplicationUniversalIdentifier,
    isSystemSideEffect: existingFlatViewField.isSystemSideEffect,
  });

  if (!isCallerOverridingViewField) {
    return [];
  }

  return [
    {
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`The related record field of a column owned by an application cannot be changed`,
      userFriendlyMessage: msg`This column comes from an application, so the related record field it shows cannot be changed`,
    },
  ];
};
