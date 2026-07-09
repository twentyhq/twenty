import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type MetadataValidationErrorResponseDescriptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/types/metadata-validation-error-response-descriptor.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type AnyFailedValidation = FailedFlatEntityValidation<
  AllMetadataName,
  WorkspaceMigrationActionType
>;

export type MetadataValidationErrorPayloadDescriptor =
  MetadataValidationErrorResponseDescriptor & {
    userFriendlyMessage: MessageDescriptor;
  };

const MANY_VALIDATION_ERRORS_MESSAGE = msg`Many validation errors`;
const METADATA_VALIDATION_FAILED_MESSAGE = msg`Metadata validation failed`;

const getMetadataValidationUserFriendlyMessage = (
  metadataValidation: MetadataValidationErrorResponseDescriptor,
): MessageDescriptor => {
  if (metadataValidation.summary.totalErrors > 1) {
    return MANY_VALIDATION_ERRORS_MESSAGE;
  }

  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    const failedValidations = metadataValidation.errors[metadataName];

    if (!isDefined(failedValidations) || failedValidations.length === 0) {
      continue;
    }

    for (const failedValidation of failedValidations) {
      for (const validationError of failedValidation.errors) {
        if (isDefined(validationError.userFriendlyMessage)) {
          return validationError.userFriendlyMessage;
        }
      }
    }
  }

  return METADATA_VALIDATION_FAILED_MESSAGE;
};

const getFailedValidationSortKey = (
  failedValidation: AnyFailedValidation,
): string => {
  const { flatEntityMinimalInformation } = failedValidation;

  if (
    'name' in flatEntityMinimalInformation &&
    typeof flatEntityMinimalInformation.name === 'string'
  ) {
    return flatEntityMinimalInformation.name;
  }

  return '';
};

// Failed validations come out of the migration builder in a nondeterministic
// order (entity maps are keyed by freshly generated universal identifiers), so
// the payload is sorted to keep API responses stable across runs.
const sortFailedValidations = (
  failedValidations: readonly AnyFailedValidation[],
): AnyFailedValidation[] =>
  [...failedValidations].sort((first, second) => {
    const firstKey = getFailedValidationSortKey(first);
    const secondKey = getFailedValidationSortKey(second);

    if (firstKey === secondKey) {
      return 0;
    }

    return firstKey < secondKey ? -1 : 1;
  });

export const buildMetadataValidationErrorPayload = (
  exception: WorkspaceMigrationBuilderException,
): MetadataValidationErrorPayloadDescriptor => {
  const { report } = exception.failedWorkspaceMigrationBuildResult;

  const { errors, summary } = (
    Object.keys(report) as (keyof typeof report)[]
  ).reduce<MetadataValidationErrorResponseDescriptor>(
    (acc, metadataName) => {
      const failedMetadataValidation = report[metadataName];

      if (failedMetadataValidation.length === 0) {
        return acc;
      }

      return {
        errors: {
          ...acc.errors,
          [metadataName]: sortFailedValidations(failedMetadataValidation),
        },
        summary: {
          ...acc.summary,
          totalErrors:
            acc.summary.totalErrors + failedMetadataValidation.length,
          [metadataName]: failedMetadataValidation.length,
        },
      };
    },
    { errors: {}, summary: { totalErrors: 0 } },
  );

  return {
    errors,
    summary,
    userFriendlyMessage: getMetadataValidationUserFriendlyMessage({
      errors,
      summary,
    }),
  };
};
