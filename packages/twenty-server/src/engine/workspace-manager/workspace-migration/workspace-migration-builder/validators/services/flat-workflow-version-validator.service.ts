import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowMetadataExceptionCode } from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { type FlatWorkflowMaps } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
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
      flatWorkflowVersionMaps: optimisticFlatWorkflowVersionMaps,
      flatWorkflowMaps: optimisticFlatWorkflowMaps,
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
      flatEntityMaps: optimisticFlatWorkflowVersionMaps,
    });

    if (isDefined(existingWorkflowVersion)) {
      validationResult.errors.push({
        code: CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_ALREADY_EXISTS,
        message: t`Workflow version already exists`,
        userFriendlyMessage: msg`This workflow version already exists`,
      });
    }

    validationResult.errors.push(
      ...this.validateParentWorkflow({
        coreWorkflowId: flatWorkflowVersion.coreWorkflowId,
        optimisticFlatWorkflowMaps,
      }),
    );

    return validationResult;
  }

  public validateFlatWorkflowVersionDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWorkflowVersionMaps: optimisticFlatWorkflowVersionMaps,
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
      flatEntityMaps: optimisticFlatWorkflowVersionMaps,
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
    finalFlatEntityMaps,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWorkflowVersionMaps: optimisticFlatWorkflowVersionMaps,
      flatWorkflowMaps: optimisticFlatWorkflowMaps,
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
      flatEntityMaps: optimisticFlatWorkflowVersionMaps,
    });

    if (!isDefined(existingWorkflowVersion)) {
      validationResult.errors.push({
        code: CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_NOT_FOUND,
        message: t`Workflow version not found`,
        userFriendlyMessage: msg`Workflow version not found`,
      });

      return validationResult;
    }

    validationResult.errors.push(
      ...this.validateParentWorkflow({
        coreWorkflowId: findFlatEntityByUniversalIdentifier({
          universalIdentifier,
          flatEntityMaps: finalFlatEntityMaps,
        })?.coreWorkflowId,
        optimisticFlatWorkflowMaps,
      }),
    );

    return validationResult;
  }

  // The parent is referenced by id rather than by universal identifier while the
  // column is still being backfilled, so a null link is a legitimate unmigrated
  // version rather than a broken one.
  private validateParentWorkflow({
    coreWorkflowId,
    optimisticFlatWorkflowMaps,
  }: {
    coreWorkflowId: string | null | undefined;
    optimisticFlatWorkflowMaps: FlatWorkflowMaps;
  }): FailedFlatEntityValidation<'workflowVersion', 'create'>['errors'] {
    if (!isNonEmptyString(coreWorkflowId)) {
      return [];
    }

    const parentWorkflow = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: coreWorkflowId,
      flatEntityMaps: optimisticFlatWorkflowMaps,
    });

    if (isDefined(parentWorkflow)) {
      return [];
    }

    return [
      {
        code: CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_MISSING_WORKFLOW,
        message: t`Workflow version references a workflow that does not exist`,
        userFriendlyMessage: msg`This workflow version is not attached to an existing workflow`,
      },
    ];
  }
}
