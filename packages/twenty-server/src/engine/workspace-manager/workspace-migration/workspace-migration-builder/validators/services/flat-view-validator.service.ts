import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType, ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

export class FlatViewValidatorService {
  constructor() {}

  private isAllowedKanbanMainGroupByField({
    mainGroupByFieldMetadata,
  }: {
    mainGroupByFieldMetadata: UniversalFlatFieldMetadata;
  }): boolean {
    if (mainGroupByFieldMetadata.type === FieldMetadataType.SELECT) {
      return true;
    }

    if (
      !isMorphOrRelationUniversalFlatFieldMetadata(mainGroupByFieldMetadata)
    ) {
      return false;
    }

    return (
      mainGroupByFieldMetadata.type === FieldMetadataType.RELATION &&
      mainGroupByFieldMetadata.universalSettings?.relationType ===
        RelationType.MANY_TO_ONE
    );
  }

  public validateFlatViewUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: optimisticFlatViewMaps,
      flatFieldMetadataMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.view
  >): FailedFlatEntityValidation<'view', 'update'> {
    const existingFlatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'view',
      type: 'update',
    });

    if (!isDefined(existingFlatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });

      return validationResult;
    }

    const updatedFlatView: UniversalFlatView = {
      ...existingFlatView,
      ...flatEntityUpdate,
    };

    const kanbanAggregateOperationFieldMetadataUniversalIdentifierUpdate =
      flatEntityUpdate.kanbanAggregateOperationFieldMetadataUniversalIdentifier;

    if (
      isDefined(
        kanbanAggregateOperationFieldMetadataUniversalIdentifierUpdate,
      ) &&
      kanbanAggregateOperationFieldMetadataUniversalIdentifierUpdate !== null &&
      !isDefined(
        findFlatEntityByUniversalIdentifier({
          universalIdentifier:
            kanbanAggregateOperationFieldMetadataUniversalIdentifierUpdate,
          flatEntityMaps: flatFieldMetadataMaps,
        }),
      )
    ) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View kanban aggregate field metadata not found`,
        userFriendlyMessage: msg`View kanban aggregate field metadata not found`,
      });
    }

    const viewBecomesKanban =
      updatedFlatView.type === ViewType.KANBAN &&
      existingFlatView.type !== ViewType.KANBAN;

    if (viewBecomesKanban) {
      if (
        !isDefined(updatedFlatView.mainGroupByFieldMetadataUniversalIdentifier)
      ) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban view must have a main group by field`,
          userFriendlyMessage: msg`Kanban view must have a main group by field`,
        });

        return validationResult;
      }

      const mainGroupByFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          updatedFlatView.mainGroupByFieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(mainGroupByFieldMetadata)) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field metadata not found`,
          userFriendlyMessage: msg`Kanban main group by field metadata not found`,
        });
      } else if (
        !this.isAllowedKanbanMainGroupByField({
          mainGroupByFieldMetadata,
        })
      ) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field must be a SELECT or a many-to-one relation field`,
          userFriendlyMessage: msg`Kanban main group by field must be a select or a many-to-one relation field`,
        });
      }
    }

    const updatedMainGroupByFieldMetadataUniversalIdentifier =
      updatedFlatView.mainGroupByFieldMetadataUniversalIdentifier;

    const mainGroupByFieldMetadataIsAddedOrUpdated =
      isDefined(updatedMainGroupByFieldMetadataUniversalIdentifier) &&
      existingFlatView.mainGroupByFieldMetadataUniversalIdentifier !==
        updatedMainGroupByFieldMetadataUniversalIdentifier;

    if (mainGroupByFieldMetadataIsAddedOrUpdated && !viewBecomesKanban) {
      const mainGroupByFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier: updatedMainGroupByFieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(mainGroupByFieldMetadata)) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field metadata not found`,
          userFriendlyMessage: msg`Kanban main group by field metadata not found`,
        });
      } else if (
        !this.isAllowedKanbanMainGroupByField({
          mainGroupByFieldMetadata,
        })
      ) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field must be a SELECT or a many-to-one relation field`,
          userFriendlyMessage: msg`Kanban main group by field must be a select or a many-to-one relation field`,
        });
      }
    }

    return validationResult;
  }

  public validateFlatViewDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: optimisticFlatViewMaps,
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.view
  >): FailedFlatEntityValidation<'view', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'view',
      type: 'delete',
    });

    const existingFlatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatViewMaps,
    });

    if (!isDefined(existingFlatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });

      return validationResult;
    }

    const parentObjectStillExists = isDefined(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: existingFlatView.objectMetadataUniversalIdentifier,
        flatEntityMaps: optimisticFlatObjectMetadataMaps,
      }),
    );

    if (parentObjectStillExists) {
      const viewsForSameObject = Object.values(
        optimisticFlatViewMaps.byUniversalIdentifier,
      ).filter(
        (view) =>
          isDefined(view) &&
          view.objectMetadataUniversalIdentifier ===
            existingFlatView.objectMetadataUniversalIdentifier,
      );

      if (viewsForSameObject.length <= 1) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Cannot delete the only view for this object`,
          userFriendlyMessage: msg`Cannot delete the only view for this object`,
        });
      }
    }

    return validationResult;
  }

  public validateFlatViewCreation({
    flatEntityToValidate: flatViewToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: optimisticFlatViewMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.view
  >): FailedFlatEntityValidation<'view', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatViewToValidate.universalIdentifier,
      },
      metadataName: 'view',
      type: 'create',
    });

    const optimisticFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewToValidate.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(optimisticFlatObjectMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    if (
      isDefined(
        findFlatEntityByUniversalIdentifier({
          universalIdentifier: flatViewToValidate.universalIdentifier,
          flatEntityMaps: optimisticFlatViewMaps,
        }),
      )
    ) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View with same universal identifier already exists`,
        userFriendlyMessage: msg`View already exists`,
      });
    }

    if (
      isDefined(
        flatViewToValidate.kanbanAggregateOperationFieldMetadataUniversalIdentifier,
      ) &&
      !isDefined(
        findFlatEntityByUniversalIdentifier({
          universalIdentifier:
            flatViewToValidate.kanbanAggregateOperationFieldMetadataUniversalIdentifier,
          flatEntityMaps: flatFieldMetadataMaps,
        }),
      )
    ) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View kanban aggregate field metadata not found`,
        userFriendlyMessage: msg`View kanban aggregate field metadata not found`,
      });
    }

    const isKanban = flatViewToValidate.type === ViewType.KANBAN;

    if (isKanban) {
      if (
        !isDefined(
          flatViewToValidate.mainGroupByFieldMetadataUniversalIdentifier,
        )
      ) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban view must have a main group by field`,
          userFriendlyMessage: msg`Kanban view must have a main group by field`,
        });

        return validationResult;
      }

      const mainGroupByFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatViewToValidate.mainGroupByFieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(mainGroupByFieldMetadata)) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field metadata not found`,
          userFriendlyMessage: msg`Kanban main group by field metadata not found`,
        });
      } else if (
        !this.isAllowedKanbanMainGroupByField({
          mainGroupByFieldMetadata,
        })
      ) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field must be a SELECT or a many-to-one relation field`,
          userFriendlyMessage: msg`Kanban main group by field must be a select or a many-to-one relation field`,
        });
      }
    }

    return validationResult;
  }
}
