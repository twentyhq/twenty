import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type RoadmapValidationError = {
  code: ViewExceptionCode;
  message: string;
  userFriendlyMessage: ReturnType<typeof msg>;
};

const ROADMAP_GROUP_ALLOWED_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.SELECT,
  FieldMetadataType.RELATION,
];

type FlatFieldMetadataMapsForValidation =
  MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<'view'>['flatFieldMetadataMaps'];

const collectRoadmapValidationErrors = ({
  flatView,
  flatFieldMetadataMaps,
}: {
  flatView: UniversalFlatView;
  flatFieldMetadataMaps: FlatFieldMetadataMapsForValidation;
}): RoadmapValidationError[] => {
  const errors: RoadmapValidationError[] = [];

  const startIdentifier = flatView.roadmapFieldStartUniversalIdentifier;
  const endIdentifier = flatView.roadmapFieldEndUniversalIdentifier;

  if (!isDefined(startIdentifier)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Roadmap view must have a start date field`,
      userFriendlyMessage: msg`Roadmap view must have a start date field`,
    });
  }

  if (!isDefined(endIdentifier)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Roadmap view must have an end date field`,
      userFriendlyMessage: msg`Roadmap view must have an end date field`,
    });
  }

  if (
    isDefined(startIdentifier) &&
    isDefined(endIdentifier) &&
    startIdentifier === endIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Roadmap start and end fields must be different`,
      userFriendlyMessage: msg`Roadmap start and end fields must be different`,
    });
  }

  const validateDateField = (
    identifier: string | null | undefined,
    missingMessage: string,
    missingUserFriendly: ReturnType<typeof msg>,
    wrongTypeMessage: string,
    wrongTypeUserFriendly: ReturnType<typeof msg>,
  ): void => {
    if (!isDefined(identifier)) {
      return;
    }
    const field = findFlatEntityByUniversalIdentifier({
      universalIdentifier: identifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    if (!isDefined(field)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: missingMessage,
        userFriendlyMessage: missingUserFriendly,
      });
      return;
    }
    if (!isFieldMetadataDateKind(field.type)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: wrongTypeMessage,
        userFriendlyMessage: wrongTypeUserFriendly,
      });
    }
  };

  validateDateField(
    startIdentifier,
    t`Roadmap start field metadata not found`,
    msg`Roadmap start field metadata not found`,
    t`Roadmap start field must be a DATE or DATE_TIME field`,
    msg`Roadmap start field must be a date field`,
  );

  validateDateField(
    endIdentifier,
    t`Roadmap end field metadata not found`,
    msg`Roadmap end field metadata not found`,
    t`Roadmap end field must be a DATE or DATE_TIME field`,
    msg`Roadmap end field must be a date field`,
  );

  const validateOptionalField = (
    identifier: string | null | undefined,
    allowedTypes: FieldMetadataType[],
    missingMessage: string,
    missingUserFriendly: ReturnType<typeof msg>,
    wrongTypeMessage: string,
    wrongTypeUserFriendly: ReturnType<typeof msg>,
  ): void => {
    if (!isDefined(identifier)) {
      return;
    }
    const field = findFlatEntityByUniversalIdentifier({
      universalIdentifier: identifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    if (!isDefined(field)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: missingMessage,
        userFriendlyMessage: missingUserFriendly,
      });
      return;
    }
    if (!allowedTypes.includes(field.type)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: wrongTypeMessage,
        userFriendlyMessage: wrongTypeUserFriendly,
      });
    }
  };

  validateOptionalField(
    flatView.roadmapFieldGroupUniversalIdentifier,
    ROADMAP_GROUP_ALLOWED_FIELD_TYPES,
    t`Roadmap group field metadata not found`,
    msg`Roadmap group field metadata not found`,
    t`Roadmap group field must be a SELECT or RELATION field`,
    msg`Roadmap group field must be a select or relation field`,
  );

  validateOptionalField(
    flatView.roadmapFieldColorUniversalIdentifier,
    [FieldMetadataType.SELECT],
    t`Roadmap color field metadata not found`,
    msg`Roadmap color field metadata not found`,
    t`Roadmap color field must be a SELECT field`,
    msg`Roadmap color field must be a select field`,
  );

  // Label field can be any type — no type assertion. Still verify FK resolves.
  if (isDefined(flatView.roadmapFieldLabelUniversalIdentifier)) {
    const labelField = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatView.roadmapFieldLabelUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    if (!isDefined(labelField)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Roadmap label field metadata not found`,
        userFriendlyMessage: msg`Roadmap label field metadata not found`,
      });
    }
  }

  if (isDefined(flatView.roadmapFieldPlannedStartUniversalIdentifier)) {
    const plannedStartField = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatView.roadmapFieldPlannedStartUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    if (!isDefined(plannedStartField)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Roadmap planned start field metadata not found`,
        userFriendlyMessage: msg`Roadmap planned start field metadata not found`,
      });
    } else if (!isFieldMetadataDateKind(plannedStartField.type)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Roadmap planned start field must be a DATE or DATE_TIME field`,
        userFriendlyMessage: msg`Roadmap planned start field must be a date field`,
      });
    }
  }

  if (isDefined(flatView.roadmapFieldPlannedEndUniversalIdentifier)) {
    const plannedEndField = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatView.roadmapFieldPlannedEndUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    if (!isDefined(plannedEndField)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Roadmap planned end field metadata not found`,
        userFriendlyMessage: msg`Roadmap planned end field metadata not found`,
      });
    } else if (!isFieldMetadataDateKind(plannedEndField.type)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Roadmap planned end field must be a DATE or DATE_TIME field`,
        userFriendlyMessage: msg`Roadmap planned end field must be a date field`,
      });
    }
  }

  validateOptionalField(
    flatView.roadmapFieldStatusUniversalIdentifier,
    [FieldMetadataType.SELECT],
    t`Roadmap status field metadata not found`,
    msg`Roadmap status field metadata not found`,
    t`Roadmap status field must be a SELECT field`,
    msg`Roadmap status field must be a select field`,
  );

  validateOptionalField(
    flatView.roadmapFieldBlockedByUniversalIdentifier,
    [FieldMetadataType.SELECT],
    t`Roadmap blocked-by field metadata not found`,
    msg`Roadmap blocked-by field metadata not found`,
    t`Roadmap blocked-by field must be a SELECT field`,
    msg`Roadmap blocked-by field must be a select field`,
  );

  return errors;
};

export class FlatViewValidatorService {
  constructor() {}

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
      } else if (mainGroupByFieldMetadata.type !== FieldMetadataType.SELECT) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field must be a SELECT field`,
          userFriendlyMessage: msg`Kanban main group by field must be a select field`,
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
      } else if (mainGroupByFieldMetadata.type !== FieldMetadataType.SELECT) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field must be a SELECT field`,
          userFriendlyMessage: msg`Kanban main group by field must be a select field`,
        });
      }
    }

    const viewBecomesRoadmap =
      updatedFlatView.type === ViewType.ROADMAP &&
      existingFlatView.type !== ViewType.ROADMAP;

    const roadmapFieldChanged =
      updatedFlatView.type === ViewType.ROADMAP &&
      (flatEntityUpdate.roadmapFieldStartUniversalIdentifier !== undefined ||
        flatEntityUpdate.roadmapFieldEndUniversalIdentifier !== undefined ||
        flatEntityUpdate.roadmapFieldGroupUniversalIdentifier !== undefined ||
        flatEntityUpdate.roadmapFieldColorUniversalIdentifier !== undefined ||
        flatEntityUpdate.roadmapFieldLabelUniversalIdentifier !== undefined ||
        flatEntityUpdate.roadmapFieldPlannedStartUniversalIdentifier !==
          undefined ||
        flatEntityUpdate.roadmapFieldPlannedEndUniversalIdentifier !==
          undefined ||
        flatEntityUpdate.roadmapFieldStatusUniversalIdentifier !== undefined ||
        flatEntityUpdate.roadmapFieldBlockedByUniversalIdentifier !==
          undefined);

    if (viewBecomesRoadmap || roadmapFieldChanged) {
      validationResult.errors.push(
        ...collectRoadmapValidationErrors({
          flatView: updatedFlatView,
          flatFieldMetadataMaps,
        }),
      );
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
      } else if (mainGroupByFieldMetadata.type !== FieldMetadataType.SELECT) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field must be a SELECT field`,
          userFriendlyMessage: msg`Kanban main group by field must be a select field`,
        });
      }
    }

    if (flatViewToValidate.type === ViewType.ROADMAP) {
      validationResult.errors.push(
        ...collectRoadmapValidationErrors({
          flatView: flatViewToValidate,
          flatFieldMetadataMaps,
        }),
      );
    }

    return validationResult;
  }
}
