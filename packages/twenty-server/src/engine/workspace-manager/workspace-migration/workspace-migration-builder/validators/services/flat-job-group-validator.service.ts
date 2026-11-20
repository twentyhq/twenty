import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  isValidJobGroupLimiter,
  type JobGroupLimiter,
} from 'twenty-shared/application';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { JobGroupExceptionCode } from 'src/engine/metadata-modules/job-group/job-group.exception';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityCreationValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-creation-validation-args.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

const getJobGroupNameErrors = (name: string): FlatEntityValidationError[] =>
  isNonEmptyString(name.trim())
    ? []
    : [
        {
          code: JobGroupExceptionCode.INVALID_JOB_GROUP_INPUT,
          message: t`Job group name is required`,
          userFriendlyMessage: msg`Job group name is required.`,
        },
      ];

const getJobGroupLimiterErrors = (
  limiter: JobGroupLimiter,
): FlatEntityValidationError[] =>
  isValidJobGroupLimiter(limiter)
    ? []
    : [
        {
          code: JobGroupExceptionCode.INVALID_JOB_GROUP_INPUT,
          message: t`Job group limiter max must be a positive integer and durationMs a positive number`,
          userFriendlyMessage: msg`The job group limiter is invalid.`,
        },
      ];

const getJobGroupNotFoundError = (): FlatEntityValidationError => ({
  code: JobGroupExceptionCode.JOB_GROUP_NOT_FOUND,
  message: t`Job group not found`,
  userFriendlyMessage: msg`Job group not found.`,
});

@Injectable()
export class FlatJobGroupValidatorService {
  public validateFlatJobGroupCreation({
    flatEntityToValidate: flatJobGroup,
  }: FlatEntityCreationValidationArgs<
    typeof ALL_METADATA_NAME.jobGroup
  >): FailedFlatEntityValidation<'jobGroup', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatJobGroup.universalIdentifier,
        name: flatJobGroup.name,
      },
      metadataName: 'jobGroup',
      type: 'create',
    });

    validationResult.errors.push(
      ...getJobGroupNameErrors(flatJobGroup.name),
      ...getJobGroupLimiterErrors(flatJobGroup.limiter),
    );

    return validationResult;
  }

  public validateFlatJobGroupUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatJobGroupMaps: optimisticFlatJobGroupMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.jobGroup
  >): FailedFlatEntityValidation<'jobGroup', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: { universalIdentifier },
      metadataName: 'jobGroup',
      type: 'update',
    });

    const existingJobGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatJobGroupMaps,
    });

    if (!isDefined(existingJobGroup)) {
      validationResult.errors.push(getJobGroupNotFoundError());

      return validationResult;
    }

    if (isDefined(flatEntityUpdate.name)) {
      validationResult.errors.push(
        ...getJobGroupNameErrors(flatEntityUpdate.name),
      );
    }

    if (isDefined(flatEntityUpdate.limiter)) {
      validationResult.errors.push(
        ...getJobGroupLimiterErrors(flatEntityUpdate.limiter),
      );
    }

    return validationResult;
  }

  public validateFlatJobGroupDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatJobGroupMaps: optimisticFlatJobGroupMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.jobGroup
  >): FailedFlatEntityValidation<'jobGroup', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'jobGroup',
      type: 'delete',
    });

    const existingJobGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatJobGroupMaps,
    });

    if (!isDefined(existingJobGroup)) {
      validationResult.errors.push(getJobGroupNotFoundError());
    }

    return validationResult;
  }
}
