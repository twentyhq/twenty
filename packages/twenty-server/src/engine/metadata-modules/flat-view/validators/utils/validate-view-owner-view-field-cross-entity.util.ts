import { msg, t } from '@lingui/core/macro';
import { FieldMetadataType, RelationType, ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

const isOneToManyRelationField = ({
  type,
  universalSettings,
}: Pick<UniversalFlatFieldMetadata, 'type' | 'universalSettings'>): boolean =>
  type === FieldMetadataType.RELATION &&
  isDefined(universalSettings) &&
  'relationType' in universalSettings &&
  universalSettings.relationType === RelationType.ONE_TO_MANY;

type OwnerViewFieldValidationMaps = Pick<
  AllUniversalFlatEntityMaps,
  'flatViewMaps' | 'flatViewFieldMaps' | 'flatFieldMetadataMaps'
>;

const countScopeViewsByOwnerViewFieldUniversalIdentifier = (
  flatViewMaps: OwnerViewFieldValidationMaps['flatViewMaps'],
): Map<string, number> => {
  const scopeViewCountByOwnerViewField = new Map<string, number>();

  for (const flatView of Object.values(flatViewMaps.byUniversalIdentifier)) {
    if (!isDefined(flatView?.ownerViewFieldUniversalIdentifier)) {
      continue;
    }

    const { ownerViewFieldUniversalIdentifier } = flatView;

    scopeViewCountByOwnerViewField.set(
      ownerViewFieldUniversalIdentifier,
      (scopeViewCountByOwnerViewField.get(ownerViewFieldUniversalIdentifier) ??
        0) + 1,
    );
  }

  return scopeViewCountByOwnerViewField;
};

const getOwnerViewFieldErrorMessages = ({
  scopeView,
  optimisticUniversalFlatMaps,
  ownerViewFieldUniversalIdentifier,
  scopeViewCount,
}: {
  scopeView: Pick<
    UniversalFlatView,
    'type' | 'objectMetadataUniversalIdentifier'
  >;
  optimisticUniversalFlatMaps: OwnerViewFieldValidationMaps;
  ownerViewFieldUniversalIdentifier: string;
  scopeViewCount: number;
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

  const scopedFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: ownerViewField.fieldMetadataUniversalIdentifier,
    flatEntityMaps: optimisticUniversalFlatMaps.flatFieldMetadataMaps,
  });

  if (
    !isDefined(scopedFieldMetadata) ||
    !isOneToManyRelationField(scopedFieldMetadata)
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
}: {
  optimisticUniversalFlatMaps: OwnerViewFieldValidationMaps;
  orchestratorActionsReport: Pick<OrchestratorActionsReport, 'view'>;
}): Pick<OrchestratorFailureReport, 'view'> => {
  const validationErrors: Pick<OrchestratorFailureReport, 'view'> = {
    view: [],
  };

  const createdScopeViews = orchestratorActionsReport.view.create
    .map(({ flatEntity }) => flatEntity)
    .filter((flatView) =>
      isDefined(flatView.ownerViewFieldUniversalIdentifier),
    );

  if (createdScopeViews.length === 0) {
    return validationErrors;
  }

  const scopeViewCountByOwnerViewField =
    countScopeViewsByOwnerViewFieldUniversalIdentifier(
      optimisticUniversalFlatMaps.flatViewMaps,
    );

  for (const scopeView of createdScopeViews) {
    const { ownerViewFieldUniversalIdentifier } = scopeView;

    if (!isDefined(ownerViewFieldUniversalIdentifier)) {
      continue;
    }

    const errorMessages = getOwnerViewFieldErrorMessages({
      scopeView,
      optimisticUniversalFlatMaps,
      ownerViewFieldUniversalIdentifier,
      scopeViewCount:
        scopeViewCountByOwnerViewField.get(ownerViewFieldUniversalIdentifier) ??
        0,
    });

    if (!isDefined(errorMessages)) {
      continue;
    }

    const failedValidation = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: scopeView.universalIdentifier,
      },
      metadataName: 'view',
      type: 'create',
    });

    failedValidation.errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      ...errorMessages,
    });

    validationErrors.view.push(failedValidation);
  }

  return validationErrors;
};
