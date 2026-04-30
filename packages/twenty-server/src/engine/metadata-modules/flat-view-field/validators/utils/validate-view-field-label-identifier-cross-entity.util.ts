import { msg, t } from '@lingui/core/macro';
import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalDeleteViewFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/types/workspace-migration-view-field-action.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

export const validateViewFieldLabelIdentifierCrossEntity = ({
  optimisticUniversalFlatMaps,
  deletedViewFieldActions,
  preDeletionFlatViewFieldMaps,
}: {
  optimisticUniversalFlatMaps: Pick<
    AllUniversalFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatViewMaps' | 'flatViewFieldMaps'
  >;
  deletedViewFieldActions: UniversalDeleteViewFieldAction[];
  preDeletionFlatViewFieldMaps: UniversalFlatEntityMaps<UniversalFlatViewField>;
}): Pick<OrchestratorFailureReport, 'viewField'> => {
  const validationErrors: Pick<OrchestratorFailureReport, 'viewField'> = {
    viewField: [],
  };

  if (deletedViewFieldActions.length === 0) {
    return validationErrors;
  }

  const alreadyCheckedViewUniversalIdentifiers = new Set<string>();

  for (const deleteAction of deletedViewFieldActions) {
    const deletedViewField = findFlatEntityByUniversalIdentifierOrThrow({
      universalIdentifier: deleteAction.universalIdentifier,
      flatEntityMaps: preDeletionFlatViewFieldMaps,
    });

    const { viewUniversalIdentifier, fieldMetadataUniversalIdentifier } =
      deletedViewField;

    if (alreadyCheckedViewUniversalIdentifiers.has(viewUniversalIdentifier)) {
      continue;
    }

    const view = findFlatEntityByUniversalIdentifier({
      universalIdentifier: viewUniversalIdentifier,
      flatEntityMaps: optimisticUniversalFlatMaps.flatViewMaps,
    });

    if (!isDefined(view) || view.type === ViewType.FIELDS_WIDGET) {
      continue;
    }

    const objectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: view.objectMetadataUniversalIdentifier,
      flatEntityMaps: optimisticUniversalFlatMaps.flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata)) {
      continue;
    }

    const { labelIdentifierFieldMetadataUniversalIdentifier } = objectMetadata;

    if (!isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
      continue;
    }

    if (
      fieldMetadataUniversalIdentifier !==
      labelIdentifierFieldMetadataUniversalIdentifier
    ) {
      continue;
    }

    alreadyCheckedViewUniversalIdentifiers.add(viewUniversalIdentifier);

    const viewFieldUniversalIdentifiers =
      view.viewFieldUniversalIdentifiers ?? [];

    const hasLabelIdentifierViewField = viewFieldUniversalIdentifiers.some(
      (viewFieldUniversalIdentifier) => {
        const viewField = findFlatEntityByUniversalIdentifier({
          universalIdentifier: viewFieldUniversalIdentifier,
          flatEntityMaps: optimisticUniversalFlatMaps.flatViewFieldMaps,
        });

        return (
          isDefined(viewField) &&
          viewField.fieldMetadataUniversalIdentifier ===
            labelIdentifierFieldMetadataUniversalIdentifier
        );
      },
    );

    if (!hasLabelIdentifierViewField) {
      const failedValidation = getEmptyFlatEntityValidationError({
        flatEntityMinimalInformation: {
          universalIdentifier: deleteAction.universalIdentifier,
          viewUniversalIdentifier,
          fieldMetadataUniversalIdentifier,
        },
        metadataName: 'viewField',
        type: 'delete',
      });

      failedValidation.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Label identifier view field cannot be deleted`,
        userFriendlyMessage: msg`Label identifier view field cannot be deleted`,
      });

      validationErrors.viewField.push(failedValidation);
    }
  }

  return validationErrors;
};
