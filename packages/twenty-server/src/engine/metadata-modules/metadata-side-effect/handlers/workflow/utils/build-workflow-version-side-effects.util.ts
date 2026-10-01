import { getWorkflowVersionUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

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

  const universalIdentifier = getWorkflowVersionUniversalIdentifier({
    applicationUniversalIdentifier: flatEntity.applicationUniversalIdentifier,
    workflowUniversalIdentifier: flatEntity.universalIdentifier,
  });

  const existingVersion =
    relatedFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier[
      universalIdentifier
    ];

  return {
    status: 'success',
    operations: {
      workflowVersion: {
        [isDefined(existingVersion)
          ? 'flatEntityToUpdate'
          : 'flatEntityToCreate']: {
          [universalIdentifier]: { ...version, universalIdentifier },
        },
      },
    },
  };
};
