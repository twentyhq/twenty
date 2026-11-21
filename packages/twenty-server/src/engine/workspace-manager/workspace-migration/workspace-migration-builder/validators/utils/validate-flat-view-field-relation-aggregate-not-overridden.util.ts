import { msg, t } from '@lingui/core/macro';

import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { validateFlatViewFieldNotOverridden } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-not-overridden.util';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const validateFlatViewFieldRelationAggregateNotOverridden = ({
  existingFlatViewField,
  updatedFlatViewField,
  buildOptions,
}: {
  existingFlatViewField: Pick<
    UniversalFlatViewField,
    | 'applicationUniversalIdentifier'
    | 'isSystemSideEffect'
    | 'relationAggregateOperation'
  >;
  updatedFlatViewField: Pick<
    UniversalFlatViewField,
    'relationAggregateOperation'
  >;
  buildOptions: Pick<
    WorkspaceMigrationValidationBuildOptions,
    | 'applicationUniversalIdentifier'
    | 'workspaceCustomApplicationUniversalIdentifier'
  >;
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (
    existingFlatViewField.relationAggregateOperation ===
    updatedFlatViewField.relationAggregateOperation
  ) {
    return [];
  }

  return validateFlatViewFieldNotOverridden({
    existingFlatViewField,
    buildOptions,
    error: {
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`The aggregate of a column owned by an application cannot be changed`,
      userFriendlyMessage: msg`This column comes from an application, so the calculation it shows cannot be changed`,
    },
  });
};
