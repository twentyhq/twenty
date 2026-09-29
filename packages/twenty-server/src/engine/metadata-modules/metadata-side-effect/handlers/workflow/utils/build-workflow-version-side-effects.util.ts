import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowMetadataExceptionCode } from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

export const buildWorkflowVersionSideEffects = ({
  flatEntity,
  relatedFlatEntityMaps,
}: BuildSideEffectsArgs<'workflow'>): MetadataSideEffectResult => {
  const version = flatEntity.flatUniversalWorkflowVersion;

  if (!isDefined(version)) {
    return { status: 'noop' };
  }

  const existingVersion =
    relatedFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier[
      version.universalIdentifier
    ];

  if (
    isDefined(existingVersion) &&
    (existingVersion.coreWorkflowId !== version.coreWorkflowId ||
      existingVersion.applicationUniversalIdentifier !==
        flatEntity.applicationUniversalIdentifier)
  ) {
    return {
      status: 'fail',
      metadataName: 'workflowVersion',
      type: 'update',
      flatEntityMinimalInformation: {
        universalIdentifier: version.universalIdentifier,
      },
      errors: [
        {
          code: CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_MISSING_WORKFLOW,
          message:
            'An application workflow cannot adopt another workflow version',
          userFriendlyMessage: msg`The workflow version belongs to another workflow or application.`,
        },
      ],
    };
  }

  return {
    status: 'success',
    operations: {
      workflowVersion: {
        [isDefined(existingVersion)
          ? 'flatEntityToUpdate'
          : 'flatEntityToCreate']: {
          [version.universalIdentifier]: version,
        },
      },
    },
  };
};
