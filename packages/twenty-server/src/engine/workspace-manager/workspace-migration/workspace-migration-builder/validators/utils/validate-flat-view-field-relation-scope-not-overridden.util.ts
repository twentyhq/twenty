import { msg, t } from '@lingui/core/macro';
import { fastDeepEqual } from 'twenty-shared/utils';

import { type FlatFieldMetadataOptionMapsForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { isFlatViewFieldRelationScopeSelectOptionMaintenance } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-flat-view-field-relation-scope-select-option-maintenance.util';
import { validateFlatViewFieldNotOverridden } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-not-overridden.util';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const validateFlatViewFieldRelationScopeNotOverridden = ({
  existingFlatViewField,
  updatedFlatViewField,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
  buildOptions,
}: {
  existingFlatViewField: Pick<
    UniversalFlatViewField,
    | 'applicationUniversalIdentifier'
    | 'isSystemSideEffect'
    | 'universalRelationScope'
  >;
  updatedFlatViewField: Pick<UniversalFlatViewField, 'universalRelationScope'>;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
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
    ) ||
    isFlatViewFieldRelationScopeSelectOptionMaintenance({
      existingUniversalRelationScope:
        existingFlatViewField.universalRelationScope,
      updatedUniversalRelationScope:
        updatedFlatViewField.universalRelationScope,
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
    })
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
