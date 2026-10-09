import {
  getWorkflowCommandMenuItemUniversalIdentifier,
  getWorkflowVersionUniversalIdentifier,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';

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
      ...buildWorkflowCommandMenuItemOperations({
        flatEntity,
        relatedFlatEntityMaps,
      }),
    },
  };
};

const buildWorkflowCommandMenuItemOperations = ({
  flatEntity,
  relatedFlatEntityMaps,
}: {
  flatEntity: UniversalFlatWorkflow;
  relatedFlatEntityMaps: BuildSideEffectsArgs<'workflow'>['relatedFlatEntityMaps'];
}): MetadataSideEffectOperationsByMetadataName => {
  const commandMenuItem = flatEntity.flatUniversalCommandMenuItem;
  const universalIdentifier = getWorkflowCommandMenuItemUniversalIdentifier({
    applicationUniversalIdentifier: flatEntity.applicationUniversalIdentifier,
    workflowUniversalIdentifier: flatEntity.universalIdentifier,
  });
  const existingCommandMenuItem =
    relatedFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
      universalIdentifier
    ];

  if (!isDefined(commandMenuItem)) {
    return isDefined(existingCommandMenuItem)
      ? {
          commandMenuItem: {
            flatEntityToDelete: {
              [universalIdentifier]: existingCommandMenuItem,
            },
          },
        }
      : {};
  }

  if (!isDefined(existingCommandMenuItem)) {
    return {
      commandMenuItem: {
        flatEntityToCreate: { [universalIdentifier]: commandMenuItem },
      },
    };
  }

  return {
    commandMenuItem: {
      flatEntityToUpdate: {
        [universalIdentifier]: {
          ...commandMenuItem,
          position: existingCommandMenuItem.position,
          isActive: existingCommandMenuItem.isActive,
          universalOverrides: existingCommandMenuItem.universalOverrides,
          createdAt: existingCommandMenuItem.createdAt,
        },
      },
    },
  };
};
