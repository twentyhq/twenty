import { getWorkflowCommandMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
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

  const { universalIdentifier } = version;
  const workflowVersions = Object.values(
    relatedFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(({ coreWorkflowId }) => coreWorkflowId === version.coreWorkflowId);
  const existingVersion =
    relatedFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier[
      universalIdentifier
    ];
  const archivedVersions = archiveOtherActiveVersions({
    versionStatus: version.status,
    universalIdentifier,
    workflowVersions,
  });
  const archivedVersionRecord = fromArrayToUniqueKeyRecord({
    array: archivedVersions,
    uniqueKey: 'universalIdentifier',
  });

  return {
    status: 'success',
    operations: {
      workflowVersion: isDefined(existingVersion)
        ? {
            flatEntityToUpdate: {
              ...archivedVersionRecord,
              [universalIdentifier]: version,
            },
          }
        : {
            flatEntityToCreate: { [universalIdentifier]: version },
            flatEntityToUpdate: archivedVersionRecord,
          },
      ...buildWorkflowCommandMenuItemOperations({
        flatEntity,
        flatCommandMenuItemMaps: relatedFlatEntityMaps.flatCommandMenuItemMaps,
        workflowVersionIds: new Set(workflowVersions.map(({ id }) => id)),
      }),
    },
  };
};

const archiveOtherActiveVersions = ({
  versionStatus,
  universalIdentifier,
  workflowVersions,
}: {
  versionStatus: WorkflowVersionStatus;
  universalIdentifier: string;
  workflowVersions: FlatWorkflowVersion[];
}): FlatWorkflowVersion[] => {
  if (versionStatus !== WorkflowVersionStatus.ACTIVE) {
    return [];
  }

  return workflowVersions
    .filter(
      (workflowVersion) =>
        workflowVersion.status === WorkflowVersionStatus.ACTIVE &&
        workflowVersion.universalIdentifier !== universalIdentifier,
    )
    .map((workflowVersion) => ({
      ...workflowVersion,
      status: WorkflowVersionStatus.ARCHIVED,
    }));
};

// A command's version binding cannot be updated, so commands bound to other versions are replaced
const buildWorkflowCommandMenuItemOperations = ({
  flatEntity,
  flatCommandMenuItemMaps,
  workflowVersionIds,
}: {
  flatEntity: UniversalFlatWorkflow;
  workflowVersionIds: Set<string>;
} & Pick<
  BuildSideEffectsArgs<'workflow'>['relatedFlatEntityMaps'],
  'flatCommandMenuItemMaps'
>): MetadataSideEffectOperationsByMetadataName => {
  const commandMenuItem = flatEntity.flatUniversalCommandMenuItem;
  const managedUniversalIdentifier =
    getWorkflowCommandMenuItemUniversalIdentifier({
      applicationUniversalIdentifier: flatEntity.applicationUniversalIdentifier,
      workflowUniversalIdentifier: flatEntity.universalIdentifier,
    });
  const existingCommandMenuItems = Object.values(
    flatCommandMenuItemMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      ({ universalIdentifier, coreWorkflowVersionId }) =>
        universalIdentifier === managedUniversalIdentifier ||
        (isDefined(coreWorkflowVersionId) &&
          workflowVersionIds.has(coreWorkflowVersionId)),
    );
  const keptCommandMenuItem = isDefined(commandMenuItem)
    ? existingCommandMenuItems.find(
        ({ coreWorkflowVersionId }) =>
          coreWorkflowVersionId === commandMenuItem.coreWorkflowVersionId,
      )
    : undefined;
  const deletedCommandMenuItems = existingCommandMenuItems.filter(
    (existingCommandMenuItem) =>
      existingCommandMenuItem !== keptCommandMenuItem,
  );
  const flatEntityToDelete = fromArrayToUniqueKeyRecord({
    array: deletedCommandMenuItems,
    uniqueKey: 'universalIdentifier',
  });

  if (!isDefined(commandMenuItem)) {
    return deletedCommandMenuItems.length > 0
      ? { commandMenuItem: { flatEntityToDelete } }
      : {};
  }

  if (isDefined(keptCommandMenuItem)) {
    return {
      commandMenuItem: {
        flatEntityToDelete,
        flatEntityToUpdate: {
          [keptCommandMenuItem.universalIdentifier]: {
            ...commandMenuItem,
            universalIdentifier: keptCommandMenuItem.universalIdentifier,
            position: keptCommandMenuItem.position,
            isActive: keptCommandMenuItem.isActive,
            universalOverrides: keptCommandMenuItem.universalOverrides,
            isSystemSideEffect: keptCommandMenuItem.isSystemSideEffect,
            workflowVersionId: keptCommandMenuItem.workflowVersionId,
            createdAt: keptCommandMenuItem.createdAt,
          },
        },
      },
    };
  }

  // A deleted command and its replacement cannot share an identifier within one migration
  const createdUniversalIdentifier = isDefined(
    flatCommandMenuItemMaps.byUniversalIdentifier[
      commandMenuItem.universalIdentifier
    ],
  )
    ? v4()
    : commandMenuItem.universalIdentifier;

  return {
    commandMenuItem: {
      flatEntityToDelete,
      flatEntityToCreate: {
        [createdUniversalIdentifier]: {
          ...commandMenuItem,
          universalIdentifier: createdUniversalIdentifier,
        },
      },
    },
  };
};
