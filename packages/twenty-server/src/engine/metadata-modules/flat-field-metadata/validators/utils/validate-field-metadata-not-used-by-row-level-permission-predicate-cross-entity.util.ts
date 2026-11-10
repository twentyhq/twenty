import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';
import { type UniversalDeleteFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

const getReferencedFieldUniversalIdentifiers = (
  predicate: UniversalFlatRowLevelPermissionPredicate,
): (string | null)[] => [
  predicate.fieldMetadataUniversalIdentifier,
  predicate.workspaceMemberFieldMetadataUniversalIdentifier,
  predicate.relationFieldMetadataUniversalIdentifier,
];

// The database cascades or nulls these references, which silently lifts the role's row restriction
export const validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity =
  ({
    optimisticUniversalFlatMaps,
    deletedFieldMetadataActions,
  }: {
    optimisticUniversalFlatMaps: Pick<
      AllUniversalFlatEntityMaps,
      | 'flatRowLevelPermissionPredicateMaps'
      | 'flatObjectMetadataMaps'
      | 'flatRoleMaps'
    >;
    deletedFieldMetadataActions: UniversalDeleteFieldAction[];
  }): Pick<OrchestratorFailureReport, 'fieldMetadata'> => {
    const validationErrors: Pick<OrchestratorFailureReport, 'fieldMetadata'> = {
      fieldMetadata: [],
    };

    if (deletedFieldMetadataActions.length === 0) {
      return validationErrors;
    }

    const deletedFieldUniversalIdentifiers = new Set(
      deletedFieldMetadataActions.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    );

    const roleLabelsByDeletedFieldUniversalIdentifier = new Map<
      string,
      Set<string>
    >();

    for (const predicate of Object.values(
      optimisticUniversalFlatMaps.flatRowLevelPermissionPredicateMaps
        .byUniversalIdentifier,
    )) {
      if (!isDefined(predicate) || isDefined(predicate.deletedAt)) {
        continue;
      }

      const role =
        optimisticUniversalFlatMaps.flatRoleMaps.byUniversalIdentifier[
          predicate.roleUniversalIdentifier
        ];
      const objectMetadata =
        optimisticUniversalFlatMaps.flatObjectMetadataMaps
          .byUniversalIdentifier[predicate.objectMetadataUniversalIdentifier];

      if (!isDefined(role) || !isDefined(objectMetadata)) {
        continue;
      }

      for (const fieldUniversalIdentifier of getReferencedFieldUniversalIdentifiers(
        predicate,
      )) {
        if (
          !isDefined(fieldUniversalIdentifier) ||
          !deletedFieldUniversalIdentifiers.has(fieldUniversalIdentifier)
        ) {
          continue;
        }

        const roleLabels =
          roleLabelsByDeletedFieldUniversalIdentifier.get(
            fieldUniversalIdentifier,
          ) ?? new Set<string>();

        roleLabels.add(role.label);
        roleLabelsByDeletedFieldUniversalIdentifier.set(
          fieldUniversalIdentifier,
          roleLabels,
        );
      }
    }

    for (const deleteAction of deletedFieldMetadataActions) {
      const roleLabels = roleLabelsByDeletedFieldUniversalIdentifier.get(
        deleteAction.universalIdentifier,
      );

      if (!isDefined(roleLabels)) {
        continue;
      }

      const fieldName =
        deleteAction.flatEntity?.name ?? deleteAction.universalIdentifier;
      const roleLabelList = [...roleLabels].join(', ');

      const failedValidation = getEmptyFlatEntityValidationError({
        flatEntityMinimalInformation: {
          universalIdentifier: deleteAction.universalIdentifier,
          name: deleteAction.flatEntity?.name,
          objectMetadataUniversalIdentifier:
            deleteAction.flatEntity?.objectMetadataUniversalIdentifier,
        },
        metadataName: 'fieldMetadata',
        type: 'delete',
      });

      failedValidation.errors.push({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: t`Field ${fieldName} is used by row-level permission rules of roles: ${roleLabelList}`,
        userFriendlyMessage: msg`Remove the row-level permission rules that use this field before deleting it`,
      });

      validationErrors.fieldMetadata.push(failedValidation);
    }

    return validationErrors;
  };
