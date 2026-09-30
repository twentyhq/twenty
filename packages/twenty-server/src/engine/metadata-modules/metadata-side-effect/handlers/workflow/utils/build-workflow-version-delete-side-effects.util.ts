import { getWorkflowVersionUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

export const buildWorkflowVersionDeleteSideEffects = ({
  flatEntity,
  relatedFlatEntityMaps,
}: BuildSideEffectsArgs<'workflow'>): MetadataSideEffectResult => {
  const universalIdentifier = getWorkflowVersionUniversalIdentifier({
    applicationUniversalIdentifier: flatEntity.applicationUniversalIdentifier,
    workflowUniversalIdentifier: flatEntity.universalIdentifier,
  });

  const managedVersion =
    relatedFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier[
      universalIdentifier
    ];

  if (!isDefined(managedVersion) || !managedVersion.isSystemSideEffect) {
    return { status: 'noop' };
  }

  return {
    status: 'success',
    operations: {
      workflowVersion: {
        flatEntityToDelete: { [universalIdentifier]: managedVersion },
      },
    },
  };
};
