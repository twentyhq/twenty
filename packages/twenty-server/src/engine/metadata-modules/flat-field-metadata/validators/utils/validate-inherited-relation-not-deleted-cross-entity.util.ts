import { msg, t } from '@lingui/core/macro';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { validateObjectMetadataInheritance } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-object-metadata-inheritance.util';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalDeleteFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

// Deleting a relation an object inherits its access through would silently
// widen that object, so it is only allowed when the same migration also lands a
// valid replacement policy
export const validateInheritedRelationNotDeletedCrossEntity = ({
  optimisticUniversalFlatMaps,
  deletedFieldActions,
}: {
  optimisticUniversalFlatMaps: Pick<
    AllUniversalFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
  >;
  deletedFieldActions: UniversalDeleteFieldAction[];
}): Pick<OrchestratorFailureReport, 'fieldMetadata'> => {
  const validationErrors: Pick<OrchestratorFailureReport, 'fieldMetadata'> = {
    fieldMetadata: [],
  };

  for (const deleteAction of deletedFieldActions) {
    const objectUniversalIdentifier =
      deleteAction.flatEntity?.objectMetadataUniversalIdentifier;

    if (!isDefined(objectUniversalIdentifier)) {
      continue;
    }

    const universalFlatObjectMetadata =
      optimisticUniversalFlatMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        objectUniversalIdentifier
      ];

    if (
      !isDefined(universalFlatObjectMetadata) ||
      universalFlatObjectMetadata.readability !== MetadataReadability.INHERITED
    ) {
      continue;
    }

    const inheritanceErrors = validateObjectMetadataInheritance({
      universalFlatObjectMetadata,
      maps: {
        universalFlatObjectMetadataMaps:
          optimisticUniversalFlatMaps.flatObjectMetadataMaps,
        universalFlatFieldMetadataMaps:
          optimisticUniversalFlatMaps.flatFieldMetadataMaps,
      },
    });

    if (inheritanceErrors.length === 0) {
      continue;
    }

    const fieldName =
      deleteAction.flatEntity?.name ?? deleteAction.universalIdentifier;

    const failedValidation = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: deleteAction.universalIdentifier,
        name: deleteAction.flatEntity?.name,
      },
      metadataName: 'fieldMetadata',
      type: 'delete',
    });

    failedValidation.errors.push({
      code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
      message: t`Field ${fieldName} is used by the inherited access of ${universalFlatObjectMetadata.nameSingular}: ${inheritanceErrors.map((error) => error.message).join('; ')}`,
      userFriendlyMessage: msg`Update the object's inherited access before deleting this relation`,
    });

    validationErrors.fieldMetadata.push(failedValidation);
  }

  return validationErrors;
};
