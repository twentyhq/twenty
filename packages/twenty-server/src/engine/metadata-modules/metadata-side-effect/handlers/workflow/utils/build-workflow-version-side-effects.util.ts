import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowMetadataExceptionCode } from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

export const buildWorkflowVersionSideEffects = ({
  flatEntity,
  relatedFlatEntityMaps,
  allFlatEntityOperationRecordByMetadataName,
}: BuildSideEffectsArgs<'workflow'>): MetadataSideEffectResult => {
  const version = flatEntity.flatUniversalWorkflowVersion;

  if (!isDefined(version)) {
    return { status: 'noop' };
  }

  const existingVersion =
    relatedFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier[
      version.universalIdentifier
    ];

  const workflowOperations =
    allFlatEntityOperationRecordByMetadataName.workflow;
  const sharesVersionWithAnotherWorkflow = [
    ...Object.values(workflowOperations?.flatEntityToCreate ?? {}),
    ...Object.values(workflowOperations?.flatEntityToUpdate ?? {}),
  ].some(
    (workflow) =>
      workflow.universalIdentifier !== flatEntity.universalIdentifier &&
      workflow.flatUniversalWorkflowVersion?.universalIdentifier ===
        version.universalIdentifier,
  );

  if (
    sharesVersionWithAnotherWorkflow ||
    (isDefined(existingVersion) &&
      (existingVersion.coreWorkflowId !== version.coreWorkflowId ||
        existingVersion.applicationUniversalIdentifier !==
          flatEntity.applicationUniversalIdentifier))
  ) {
    return {
      status: 'fail',
      metadataName: 'workflowVersion',
      type: isDefined(existingVersion) ? 'update' : 'create',
      flatEntityMinimalInformation: {
        universalIdentifier: version.universalIdentifier,
      },
      errors: [
        {
          code: CoreWorkflowMetadataExceptionCode.INVALID_WORKFLOW_VERSION_DEFINITION,
          message: 'Application workflows cannot share a version identifier',
          userFriendlyMessage: msg`Each application workflow must have its own version identifier.`,
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
