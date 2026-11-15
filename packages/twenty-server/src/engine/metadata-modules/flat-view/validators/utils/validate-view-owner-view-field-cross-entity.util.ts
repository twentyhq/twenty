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
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

type OwnerViewFieldValidationMaps = Pick<
  AllUniversalFlatEntityMaps,
  'flatViewMaps' | 'flatViewFieldMaps' | 'flatFieldMetadataMaps'
>;

const getOwnerViewFieldErrorMessages = ({
  scopeView,
  ownerViewField,
  scopeViewCount,
  optimisticUniversalFlatMaps,
}: {
  scopeView: Pick<
    UniversalFlatView,
    | 'type'
    | 'objectMetadataUniversalIdentifier'
    | 'applicationUniversalIdentifier'
    | 'visibility'
    | 'createdByUserWorkspaceId'
  >;
  ownerViewField: UniversalFlatViewField | undefined;
  scopeViewCount: number;
  optimisticUniversalFlatMaps: OwnerViewFieldValidationMaps;
}) => {
  if (scopeView.type !== ViewType.TABLE_WIDGET) {
    return {
      message: t`A view scoping a view field must be of type TABLE_WIDGET`,
      userFriendlyMessage: msg`Invalid column scope`,
    };
  }

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

  const scopeViews = Object.values(
    optimisticUniversalFlatMaps.flatViewMaps.byUniversalIdentifier,
  ).filter(
    (
      flatView,
    ): flatView is UniversalFlatView & {
      ownerViewFieldUniversalIdentifier: string;
    } => isDefined(flatView?.ownerViewFieldUniversalIdentifier),
  );

  const scopeViewCountByOwnerViewFieldUniversalIdentifier = new Map<
    string,
    number
  >();

  for (const { ownerViewFieldUniversalIdentifier } of scopeViews) {
    scopeViewCountByOwnerViewFieldUniversalIdentifier.set(
      ownerViewFieldUniversalIdentifier,
      (scopeViewCountByOwnerViewFieldUniversalIdentifier.get(
        ownerViewFieldUniversalIdentifier,
      ) ?? 0) + 1,
    );
  }

  // A workspace caller relies on the database cascade; an application must drop the scope views it keeps declaring
  if (!isWorkspaceCaller) {
    for (const { universalIdentifier } of orchestratorActionsReport.viewField
      .delete) {
      if (
        !scopeViewCountByOwnerViewFieldUniversalIdentifier.has(
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
  const updatedViewUniversalIdentifiers = new Set(
    orchestratorActionsReport.view.update
      .filter(
        ({ update }) =>
          isDefined(update.type) ||
          isDefined(update.visibility) ||
          update.createdByUserWorkspaceId !== undefined,
      )
      .map(({ universalIdentifier }) => universalIdentifier),
  );

  const createdViewUniversalIdentifiers = new Set(
    orchestratorActionsReport.view.create.map(
      ({ flatEntity }) => flatEntity.universalIdentifier,
    ),
  );

  for (const scopeView of scopeViews) {
    const ownerViewField = findFlatEntityByUniversalIdentifier({
      universalIdentifier: scopeView.ownerViewFieldUniversalIdentifier,
      flatEntityMaps: optimisticUniversalFlatMaps.flatViewFieldMaps,
    });
    const isCreated = createdViewUniversalIdentifiers.has(
      scopeView.universalIdentifier,
    );
    const isAffectedByViewUpdate =
      updatedViewUniversalIdentifiers.has(scopeView.universalIdentifier) ||
      (isDefined(ownerViewField) &&
        updatedViewUniversalIdentifiers.has(
          ownerViewField.viewUniversalIdentifier,
        ));

    if (!isCreated && !isAffectedByViewUpdate) {
      continue;
    }

    const errorMessages = getOwnerViewFieldErrorMessages({
      scopeView,
      ownerViewField,
      scopeViewCount:
        scopeViewCountByOwnerViewFieldUniversalIdentifier.get(
          scopeView.ownerViewFieldUniversalIdentifier,
        ) ?? 0,
      optimisticUniversalFlatMaps,
    });

    if (!isDefined(errorMessages)) {
      continue;
    }

    const failedValidation = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: scopeView.universalIdentifier,
      },
      metadataName: 'view',
      type: isCreated ? 'create' : 'update',
    });

    failedValidation.errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      ...errorMessages,
    });

    validationErrors.view.push(failedValidation);
  }

  return validationErrors;
};
