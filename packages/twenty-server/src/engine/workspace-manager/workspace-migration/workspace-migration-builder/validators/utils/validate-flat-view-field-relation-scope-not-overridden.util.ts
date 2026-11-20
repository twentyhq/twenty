import { msg, t } from '@lingui/core/macro';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { validateFlatViewFieldNotOverridden } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-not-overridden.util';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

// Filter values stay writable: renaming or deleting a select option rewrites them as a side effect of the field update
const omitRelationScopeFilterValues = (
  universalRelationScope: UniversalFlatViewField['universalRelationScope'],
) =>
  isDefined(universalRelationScope)
    ? {
        ...universalRelationScope,
        filters: universalRelationScope.filters.map(
          ({ value: _value, ...filter }) => filter,
        ),
      }
    : universalRelationScope;

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
      omitRelationScopeFilterValues(
        existingFlatViewField.universalRelationScope,
      ),
      omitRelationScopeFilterValues(
        updatedFlatViewField.universalRelationScope,
      ),
    )
  ) {
    return [];
  }

  return validateFlatViewFieldNotOverridden({
    existingFlatViewField,
    buildOptions,
    error: {
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`The relation scope of a column owned by an application cannot be changed`,
      userFriendlyMessage: msg`This column comes from an application, so the related records it shows cannot be changed`,
    },
  });
};
