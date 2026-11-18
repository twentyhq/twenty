import { msg, t } from '@lingui/core/macro';
import { fastDeepEqual } from 'twenty-shared/utils';

import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

// Not overridable, like the relation target: the owner's next sync would undo the change
export const validateFlatViewFieldRelationScopeNotOverridden = ({
  existingFlatViewField,
  updatedFlatViewField,
  buildOptions,
}: {
  existingFlatViewField: Pick<
    UniversalFlatViewField,
    | 'applicationUniversalIdentifier'
    | 'isSystemSideEffect'
    | 'universalRelationScope'
  >;
  updatedFlatViewField: Pick<UniversalFlatViewField, 'universalRelationScope'>;
  buildOptions: Pick<
    WorkspaceMigrationValidationBuildOptions,
    | 'applicationUniversalIdentifier'
    | 'workspaceCustomApplicationUniversalIdentifier'
  >;
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (
    fastDeepEqual(
      existingFlatViewField.universalRelationScope,
      updatedFlatViewField.universalRelationScope,
    )
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
      message: t`The relation scope of a column owned by an application cannot be changed`,
      userFriendlyMessage: msg`This column comes from an application, so the related records it shows cannot be changed`,
    },
  ];
};
