import { msg, t } from '@lingui/core/macro';
import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isOneToManyRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-one-to-many-relation-universal-flat-field-metadata.util';
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
    'type' | 'objectMetadataUniversalIdentifier'
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

  const scopedFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: ownerViewField.fieldMetadataUniversalIdentifier,
    flatEntityMaps: optimisticUniversalFlatMaps.flatFieldMetadataMaps,
  });

  if (
    !isDefined(scopedFieldMetadata) ||
    !isOneToManyRelationUniversalFlatFieldMetadata(scopedFieldMetadata)
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
}: {
  optimisticUniversalFlatMaps: OwnerViewFieldValidationMaps;
  orchestratorActionsReport: Pick<OrchestratorActionsReport, 'view'>;
}): Pick<OrchestratorFailureReport, 'view'> => {
  const validationErrors: Pick<OrchestratorFailureReport, 'view'> = {
    view: [],
  };

  for (const { flatEntity: scopeView } of orchestratorActionsReport.view
    .create) {
    const { ownerViewFieldUniversalIdentifier } = scopeView;

    if (!isDefined(ownerViewFieldUniversalIdentifier)) {
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
