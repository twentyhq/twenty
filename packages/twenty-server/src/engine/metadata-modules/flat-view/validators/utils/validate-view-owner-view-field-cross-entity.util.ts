import { msg, t } from '@lingui/core/macro';
import { RelationType, ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

type OwnerViewFieldValidationMaps = Pick<
  AllUniversalFlatEntityMaps,
  'flatViewMaps' | 'flatViewFieldMaps' | 'flatFieldMetadataMaps'
>;

const getOwnerViewFieldErrorMessages = ({
  scopeView,
  optimisticUniversalFlatMaps,
  ownerViewFieldUniversalIdentifier,
}: {
  scopeView: Pick<
    UniversalFlatView,
    | 'type'
    | 'objectMetadataUniversalIdentifier'
    | 'applicationUniversalIdentifier'
    | 'visibility'
    | 'createdByUserWorkspaceId'
  >;
  optimisticUniversalFlatMaps: OwnerViewFieldValidationMaps;
  ownerViewFieldUniversalIdentifier: string;
}) => {
  if (scopeView.type !== ViewType.TABLE_WIDGET) {
    return {
      message: t`A view scoping a view field must be of type TABLE_WIDGET`,
      userFriendlyMessage: msg`Invalid column scope`,
    };
  }

  const ownerViewField = findFlatEntityByUniversalIdentifier({
    universalIdentifier: ownerViewFieldUniversalIdentifier,
    flatEntityMaps: optimisticUniversalFlatMaps.flatViewFieldMaps,
  });

  if (!isDefined(ownerViewField)) {
    return {
      message: t`Owner view field not found`,
      userFriendlyMessage: msg`The column this view scopes no longer exists`,
    };
  }

  if (ownerViewField.isCanonical) {
    return {
      message: t`Only a non-canonical view field can be scoped`,
      userFriendlyMessage: msg`Only added columns can be scoped`,
    };
  }

  if (
    ownerViewField.applicationUniversalIdentifier !==
    scopeView.applicationUniversalIdentifier
  ) {
    return {
      message: t`A view scoping a view field must belong to the same application`,
      userFriendlyMessage: msg`This column cannot be scoped`,
    };
  }

  const ownerParentView = findFlatEntityByUniversalIdentifier({
    universalIdentifier: ownerViewField.viewUniversalIdentifier,
    flatEntityMaps: optimisticUniversalFlatMaps.flatViewMaps,
  });

  if (
    isDefined(ownerParentView) &&
    (ownerParentView.visibility !== scopeView.visibility ||
      ownerParentView.createdByUserWorkspaceId !==
        scopeView.createdByUserWorkspaceId)
  ) {
    return {
      message: t`A view scoping a view field must share the visibility of the view holding that field`,
      userFriendlyMessage: msg`A column scope follows the visibility of its view`,
    };
  }

  const scopedFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: ownerViewField.fieldMetadataUniversalIdentifier,
    flatEntityMaps: optimisticUniversalFlatMaps.flatFieldMetadataMaps,
  });

  if (
    !isDefined(scopedFieldMetadata) ||
    !isRelationUniversalFlatFieldMetadataOfType({
      flatFieldMetadata: scopedFieldMetadata,
      relationType: RelationType.ONE_TO_MANY,
    })
  ) {
    return {
      message: t`Only a view field of a one-to-many relation can be scoped`,
      userFriendlyMessage: msg`Only a column listing related records can be scoped`,
    };
  }

  if (
    scopedFieldMetadata.relationTargetObjectMetadataUniversalIdentifier !==
    scopeView.objectMetadataUniversalIdentifier
  ) {
    return {
      message: t`A view scoping a view field must be on the relation target object`,
      userFriendlyMessage: msg`The column scope must be on the related object`,
    };
  }

  const scopeViewCount = Object.values(
    optimisticUniversalFlatMaps.flatViewMaps.byUniversalIdentifier,
  ).filter(
    (flatView) =>
      flatView?.ownerViewFieldUniversalIdentifier ===
      ownerViewFieldUniversalIdentifier,
  ).length;

  if (scopeViewCount > 1) {
    return {
      message: t`A view field can be scoped by only one view`,
      userFriendlyMessage: msg`This column already has a scope`,
    };
  }

  return undefined;
};

export const validateViewOwnerViewFieldCrossEntity = ({
  optimisticUniversalFlatMaps,
  orchestratorActionsReport,
  isWorkspaceCaller,
}: {
  optimisticUniversalFlatMaps: OwnerViewFieldValidationMaps;
  orchestratorActionsReport: Pick<
    OrchestratorActionsReport,
    'view' | 'viewField'
  >;
  isWorkspaceCaller: boolean;
}): Pick<OrchestratorFailureReport, 'view' | 'viewField'> => {
  const validationErrors: Pick<
    OrchestratorFailureReport,
    'view' | 'viewField'
  > = {
    view: [],
    viewField: [],
  };

  // A workspace caller relies on the database cascade; an application must drop the scope views it keeps declaring
  if (!isWorkspaceCaller) {
    const ownerViewFieldUniversalIdentifiersOfKeptScopeViews = new Set(
      Object.values(
        optimisticUniversalFlatMaps.flatViewMaps.byUniversalIdentifier,
      )
        .map((flatView) => flatView?.ownerViewFieldUniversalIdentifier)
        .filter(isDefined),
    );

    for (const { universalIdentifier } of orchestratorActionsReport.viewField
      .delete) {
      if (
        !ownerViewFieldUniversalIdentifiersOfKeptScopeViews.has(
          universalIdentifier,
        )
      ) {
        continue;
      }

      const failedValidation = getEmptyFlatEntityValidationError({
        flatEntityMinimalInformation: { universalIdentifier },
        metadataName: 'viewField',
        type: 'delete',
      });

      failedValidation.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`A view field cannot be removed while the view scoping it is kept`,
        userFriendlyMessage: msg`Remove the column scope before removing the column`,
      });

      validationErrors.viewField.push(failedValidation);
    }
  }

  // The owner never changes after creation, but a type or visibility update could break the scope
  const scopeViewsToValidate = [
    ...orchestratorActionsReport.view.create.map(({ flatEntity }) => ({
      scopeView: flatEntity,
      type: 'create' as const,
    })),
    ...orchestratorActionsReport.view.update
      .filter(
        ({ update }) =>
          isDefined(update.type) ||
          isDefined(update.visibility) ||
          update.createdByUserWorkspaceId !== undefined,
      )
      .map(({ universalIdentifier }) => ({
        scopeView: findFlatEntityByUniversalIdentifier({
          universalIdentifier,
          flatEntityMaps: optimisticUniversalFlatMaps.flatViewMaps,
        }),
        type: 'update' as const,
      })),
  ];

  for (const { scopeView, type } of scopeViewsToValidate) {
    const ownerViewFieldUniversalIdentifier =
      scopeView?.ownerViewFieldUniversalIdentifier;

    if (
      !isDefined(scopeView) ||
      !isDefined(ownerViewFieldUniversalIdentifier)
    ) {
      continue;
    }

    const errorMessages = getOwnerViewFieldErrorMessages({
      scopeView,
      optimisticUniversalFlatMaps,
      ownerViewFieldUniversalIdentifier,
    });

    if (!isDefined(errorMessages)) {
      continue;
    }

    const failedValidation = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: scopeView.universalIdentifier,
      },
      metadataName: 'view',
      type,
    });

    failedValidation.errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      ...errorMessages,
    });

    validationErrors.view.push(failedValidation);
  }

  return validationErrors;
};
