import { getWorkflowVersionUniversalIdentifier } from 'twenty-shared/application';

import { buildWorkflowVersionDeleteSideEffects } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/build-workflow-version-delete-side-effects.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';

const APPLICATION_ID = '11111111-1111-4111-8111-111111111111';
const WORKFLOW_ID = '22222222-2222-4222-8222-222222222222';
const MANAGED_VERSION_ID = getWorkflowVersionUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_ID,
  workflowUniversalIdentifier: WORKFLOW_ID,
});

const deletedWorkflow = {
  universalIdentifier: WORKFLOW_ID,
  applicationUniversalIdentifier: APPLICATION_ID,
} as UniversalFlatWorkflow;

const buildDeleteSideEffects = (
  fillMaps: (
    relatedFlatEntityMaps: ReturnType<typeof createEmptyAllFlatEntityMaps>,
  ) => void,
) => {
  const relatedFlatEntityMaps = createEmptyAllFlatEntityMaps();

  fillMaps(relatedFlatEntityMaps);

  return buildWorkflowVersionDeleteSideEffects({
    flatEntity: deletedWorkflow,
    allFlatEntityOperationRecordByMetadataName: {},
    relatedFlatEntityMaps,
    context: {
      buildOptions: {
        isSystemBuild: false,
        applicationUniversalIdentifier: APPLICATION_ID,
      },
    },
  });
};

describe('buildWorkflowVersionDeleteSideEffects', () => {
  it('deletes the managed version of a deleted application workflow', () => {
    expect(
      buildDeleteSideEffects((maps) => {
        maps.flatWorkflowVersionMaps.byUniversalIdentifier[MANAGED_VERSION_ID] =
          {
            universalIdentifier: MANAGED_VERSION_ID,
            isSystemSideEffect: true,
          } as FlatWorkflowVersion;
      }),
    ).toMatchObject({
      status: 'success',
      operations: {
        workflowVersion: {
          flatEntityToDelete: {
            [MANAGED_VERSION_ID]: { universalIdentifier: MANAGED_VERSION_ID },
          },
        },
      },
    });
  });

  it('returns noop when no version is deletable', () => {
    expect(buildDeleteSideEffects(() => undefined)).toEqual({
      status: 'noop',
    });
    expect(
      buildDeleteSideEffects((maps) => {
        maps.flatWorkflowVersionMaps.byUniversalIdentifier[MANAGED_VERSION_ID] =
          {
            universalIdentifier: MANAGED_VERSION_ID,
            isSystemSideEffect: false,
          } as FlatWorkflowVersion;
      }),
    ).toEqual({ status: 'noop' });
  });

  it('deletes every version of the workflow with its command menu items', () => {
    const result = buildDeleteSideEffects((maps) => {
      maps.flatWorkflowMaps.byUniversalIdentifier[WORKFLOW_ID] = {
        id: 'core-workflow-id',
        universalIdentifier: WORKFLOW_ID,
      } as FlatWorkflow;

      const versions = [
        {
          id: 'active-version-id',
          universalIdentifier: 'active-version',
          coreWorkflowId: 'core-workflow-id',
          workspaceWorkflowVersionId: 'mirror-active-version-id',
        },
        {
          id: 'draft-version-id',
          universalIdentifier: 'draft-version',
          coreWorkflowId: 'core-workflow-id',
          workspaceWorkflowVersionId: null,
        },
        {
          id: 'other-version-id',
          universalIdentifier: 'other-version',
          coreWorkflowId: 'other-core-workflow-id',
          workspaceWorkflowVersionId: null,
        },
      ];

      for (const version of versions) {
        maps.flatWorkflowVersionMaps.byUniversalIdentifier[
          version.universalIdentifier
        ] = version as FlatWorkflowVersion;
      }

      const commandMenuItems = [
        {
          universalIdentifier: 'core-version-item',
          coreWorkflowVersionId: 'active-version-id',
          workflowVersionId: null,
        },
        {
          universalIdentifier: 'mirror-version-item',
          coreWorkflowVersionId: null,
          workflowVersionId: 'mirror-active-version-id',
        },
        {
          universalIdentifier: 'other-version-item',
          coreWorkflowVersionId: 'other-version-id',
          workflowVersionId: null,
        },
      ];

      for (const commandMenuItem of commandMenuItems) {
        maps.flatCommandMenuItemMaps.byUniversalIdentifier[
          commandMenuItem.universalIdentifier
        ] = commandMenuItem as FlatCommandMenuItem;
      }
    });

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      return;
    }

    expect(
      Object.keys(result.operations.workflowVersion?.flatEntityToDelete ?? {}),
    ).toEqual(['active-version', 'draft-version']);
    expect(
      Object.keys(result.operations.commandMenuItem?.flatEntityToDelete ?? {}),
    ).toEqual(['core-version-item', 'mirror-version-item']);
  });
});
