import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { type ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

// A change from another application would land on the owner's column and be undone by the owner's next sync
export const validateFlatViewFieldNotOverridden = ({
  existingFlatViewField,
  buildOptions,
  error,
}: {
  existingFlatViewField: Pick<
    UniversalFlatViewField,
    'applicationUniversalIdentifier' | 'isSystemSideEffect'
  >;
  buildOptions: Pick<
    WorkspaceMigrationValidationBuildOptions,
    | 'applicationUniversalIdentifier'
    | 'workspaceCustomApplicationUniversalIdentifier'
  >;
  error: FlatEntityValidationError<ViewExceptionCode>;
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  const isCallerOverridingViewField = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier:
      buildOptions.applicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      existingFlatViewField.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier:
      buildOptions.workspaceCustomApplicationUniversalIdentifier,
    isSystemSideEffect: existingFlatViewField.isSystemSideEffect,
  });

  return isCallerOverridingViewField ? [error] : [];
};
