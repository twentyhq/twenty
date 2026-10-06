import { getWorkflowVersionUniversalIdentifier } from 'twenty-shared/application';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { buildWorkflowVersionDeleteSideEffects } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/build-workflow-version-delete-side-effects.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';

const APPLICATION_ID = '11111111-1111-4111-8111-111111111111';
const WORKFLOW_ID = '22222222-2222-4222-8222-222222222222';
const MANAGED_VERSION_ID = getWorkflowVersionUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_ID,
  workflowUniversalIdentifier: WORKFLOW_ID,
});

const OWNED_FUNCTION_ID = '33333333-3333-4333-8333-333333333333';
const SHARED_FUNCTION_ID = '44444444-4444-4444-8444-444444444444';

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

const aiAgentStep = (agentId: string) => ({
  id: `step-${agentId}`,
  name: 'Agent',
  type: WorkflowActionType.AI_AGENT,
  valid: true,
  nextStepIds: [],
  settings: { input: { agentId, prompt: '' } },
});

const codeStep = (logicFunctionId: string) => ({
  id: `step-${logicFunctionId}`,
  name: 'Code',
  type: WorkflowActionType.CODE,
  valid: true,
  nextStepIds: [],
  settings: { input: { logicFunctionId } },
});

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

  it('deletes every version of the workflow with its command menu items and the CODE functions and agents only it uses', () => {
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
          steps: [codeStep(OWNED_FUNCTION_ID), aiAgentStep('owned-agent-id')],
        },
        {
          id: 'draft-version-id',
          universalIdentifier: 'draft-version',
          coreWorkflowId: 'core-workflow-id',
          workspaceWorkflowVersionId: null,
          steps: [codeStep(SHARED_FUNCTION_ID)],
        },
        {
          id: 'other-version-id',
          universalIdentifier: 'other-version',
          coreWorkflowId: 'other-core-workflow-id',
          workspaceWorkflowVersionId: null,
          steps: [codeStep(SHARED_FUNCTION_ID)],
        },
      ];

      for (const version of versions) {
        maps.flatWorkflowVersionMaps.byUniversalIdentifier[
          version.universalIdentifier
        ] = version as unknown as FlatWorkflowVersion;
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

      maps.flatAgentMaps.byUniversalIdentifier['owned-agent'] = {
        id: 'owned-agent-id',
        universalIdentifier: 'owned-agent',
        isSystem: true,
      } as FlatAgent;
      maps.flatRoleTargetMaps.byUniversalIdentifier['owned-agent-target'] = {
        id: 'owned-agent-target-id',
        universalIdentifier: 'owned-agent-target',
        roleId: 'agent-role-id',
        agentId: 'owned-agent-id',
      } as FlatRoleTarget;
      maps.flatRoleMaps.byUniversalIdentifier['agent-role'] = {
        id: 'agent-role-id',
        universalIdentifier: 'agent-role',
        canBeAssignedToAgents: true,
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
      } as FlatRole;

      for (const logicFunctionId of [OWNED_FUNCTION_ID, SHARED_FUNCTION_ID]) {
        maps.flatLogicFunctionMaps.byUniversalIdentifier[
          `${logicFunctionId}-universal`
        ] = {
          id: logicFunctionId,
          universalIdentifier: `${logicFunctionId}-universal`,
        } as FlatLogicFunction;
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
    expect(
      Object.keys(result.operations.logicFunction?.flatEntityToDelete ?? {}),
    ).toEqual([`${OWNED_FUNCTION_ID}-universal`]);
    expect(
      Object.keys(result.operations.agent?.flatEntityToDelete ?? {}),
    ).toEqual(['owned-agent']);
    expect(
      Object.keys(result.operations.roleTarget?.flatEntityToDelete ?? {}),
    ).toEqual(['owned-agent-target']);
    expect(
      Object.keys(result.operations.role?.flatEntityToDelete ?? {}),
    ).toEqual(['agent-role']);
  });
});
