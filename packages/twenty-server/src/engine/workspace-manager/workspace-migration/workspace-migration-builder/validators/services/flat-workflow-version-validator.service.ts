import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowMetadataExceptionCode } from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatWorkflowVersionValidatorService {
  public validateFlatWorkflowVersionCreation({
    flatEntityToValidate: flatWorkflowVersion,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWorkflowVersionMaps: optimisticFlatWorkflowMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.workflowVersion
  >): FailedFlatEntityValidation<'workflowVersion', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatWorkflowVersion.universalIdentifier,
      },
      metadataName: 'workflowVersion',
      type: 'create',
    });

    const existingWorkflowVersion = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatWorkflowVersion.universalIdentifier,
      flatEntityMaps: optimisticFlatWorkflowMaps,
    });

    if (isDefined(existingWorkflowVersion)) {
      validationResult.errors.push({
        code: CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_ALREADY_EXISTS,
        message: t`Workflow version already exists`,
        userFriendlyMessage: msg`This workflow version already exists`,
      });
    }

    return validationResult;
  }

  public validateFlatWorkflowVersionDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWorkflowVersionMaps: optimisticFlatWorkflowMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.workflowVersion
  >): FailedFlatEntityValidation<'workflowVersion', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'workflowVersion',
      type: 'delete',
    });

    const existingWorkflowVersion = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatWorkflowMaps,
    });

    if (!isDefined(existingWorkflowVersion)) {
      validationResult.errors.push({
        code: CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_NOT_FOUND,
        message: t`Workflow version not found`,
        userFriendlyMessage: msg`Workflow version not found`,
      });
    }

    return validationResult;
  }

  public validateFlatWorkflowVersionUpdate({
    universalIdentifier,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWorkflowVersionMaps: optimisticFlatWorkflowMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.workflowVersion
  >): FailedFlatEntityValidation<'workflowVersion', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'workflowVersion',
      type: 'update',
    });

    const existingWorkflowVersion = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatWorkflowMaps,
    });

    if (!isDefined(existingWorkflowVersion)) {
      validationResult.errors.push({
        code: CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_NOT_FOUND,
        message: t`Workflow version not found`,
        userFriendlyMessage: msg`Workflow version not found`,
      });
    }

    return validationResult;
  }
}
