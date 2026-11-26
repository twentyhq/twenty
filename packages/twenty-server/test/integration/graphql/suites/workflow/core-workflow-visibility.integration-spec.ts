import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { PermissionFlagType } from 'twenty-shared/constants';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { listChatThreadIds } from 'test/integration/utils/list-chat-thread-ids.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';
import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  linkCoreWorkflowToLegacyWorkspaceIds,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { type CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { type AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { type WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';

const recomputeAppleWorkflowCaches = (
  cacheKeyNames: ('flatWorkflowMaps' | 'flatWorkflowVersionMaps')[],
) =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, cacheKeyNames);

const client = request(`http://localhost:${APP_PORT}`);

const graphqlRequestAs = (
  accessToken: string,
  query: string,
  variables?: object,
) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ query, variables });

const metadataRequestAs = (
  accessToken: string,
  query: string,
  variables?: object,
) =>
  client
    .post('/metadata')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ query, variables });

const asOtherMember = (query: string, variables?: object) =>
  graphqlRequestAs(APPLE_JONY_MEMBER_ACCESS_TOKEN, query, variables);

const CORE_WORKFLOW_BY_ID_QUERY = `
  query CoreWorkflowById($coreWorkflowId: UUID!) {
    coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
      id
      isPrivate
      canChangeVisibility
    }
  }
`;

const CORE_WORKFLOWS_QUERY = `
  query CoreWorkflows {
    coreWorkflows(first: 100) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const CORE_WORKFLOW_VERSION_BY_ID_QUERY = `
  query CoreWorkflowVersionById($coreWorkflowVersionId: UUID!) {
    coreWorkflowVersionById(coreWorkflowVersionId: $coreWorkflowVersionId) {
      id
      steps
    }
  }
`;

const CORE_WORKFLOW_VERSIONS_QUERY = `
  query CoreWorkflowVersions($workspaceWorkflowId: UUID!) {
    coreWorkflowVersions(workspaceWorkflowId: $workspaceWorkflowId) {
      id
    }
  }
`;

const COMPUTE_STEP_OUTPUT_SCHEMA_MUTATION = `
  mutation ComputeStepOutputSchema($input: ComputeStepOutputSchemaInput!) {
    computeStepOutputSchema(input: $input)
  }
`;

const CORE_WORKFLOW_WITH_NAME_BY_ID_QUERY = `
  query CoreWorkflowWithNameById($coreWorkflowId: UUID!) {
    coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
      id
      name
      isPrivate
      canChangeVisibility
    }
  }
`;

const UPDATE_CORE_WORKFLOW_MUTATION = `
  mutation UpdateCoreWorkflow($input: UpdateCoreWorkflowInput!) {
    updateCoreWorkflow(input: $input) {
      id
      name
      isPrivate
    }
  }
`;

const RUN_MUTATION = `
  mutation RunCoreWorkflowVersion($input: RunCoreWorkflowVersionInput!) {
    runCoreWorkflowVersion(input: $input) {
      workflowRunId
    }
  }
`;

const DUPLICATE_CORE_WORKFLOW_MUTATION = `
  mutation DuplicateCoreWorkflow($input: DuplicateCoreWorkflowInput!) {
    duplicateCoreWorkflow(input: $input) {
      id
    }
  }
`;

const DELETE_CORE_WORKFLOWS_MUTATION = `
  mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
    deleteCoreWorkflows(input: $input) {
      id
    }
  }
`;

const setIsPrivate = ({
  coreWorkflowId,
  isPrivate,
}: {
  coreWorkflowId: string;
  isPrivate: boolean;
}) =>
  workflowGraphqlRequest(UPDATE_CORE_WORKFLOW_MUTATION, {
    input: { coreWorkflowId, isPrivate },
  });

const listCoreWorkflowIds = async (
  requester: (query: string) => request.Test,
) => {
  const response = await requester(CORE_WORKFLOWS_QUERY);

  expect(response.body.errors).toBeUndefined();

  return response.body.data.coreWorkflows.edges.map(
    ({ node }: { node: { id: string } }) => node.id,
  );
};

const createWorkflowWithLegacyIds = async (name: string) => {
  const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
    name,
  });

  const { workspaceWorkflowId } = await linkCoreWorkflowToLegacyWorkspaceIds({
    coreWorkflowId,
  });

  return { coreWorkflowId, coreWorkflowVersionId, workspaceWorkflowId };
};

const activateManualTrigger = async (coreWorkflowVersionId: string) => {
  await updateCoreWorkflowVersionTrigger({
    coreWorkflowVersionId,
    trigger: {
      name: 'Manual Trigger',
      type: 'MANUAL',
      settings: { outputSchema: {} },
      nextStepIds: [],
      position: { x: 0, y: 0 },
    },
  });

  await createCoreWorkflowVersionStep({
    coreWorkflowVersionId,
    stepType: 'FIND_RECORDS',
  });

  await activateCoreWorkflowVersion({ coreWorkflowVersionId });
};

const createActiveManualWorkflow = async (name: string) => {
  const createdWorkflow = await createCoreWorkflow({ name });

  await activateManualTrigger(createdWorkflow.coreWorkflowVersionId);

  return createdWorkflow;
};

describe('core workflow visibility (e2e)', () => {
  let workspaceWorkflowId: string;
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;
  let originalMemberRoleId: string;
  let workflowsRoleId: string;

  beforeAll(async () => {
    // The workflow API requires the WORKFLOWS settings permission, which the seeded Member role lacks,
    // so the second member gets it and only visibility can block them.
    const memberRole = await findOneRoleByLabel({ label: 'Member' });

    originalMemberRoleId = memberRole.id;

    const { data: createdRole } = await createOneRole({
      expectToFail: false,
      input: {
        label: `Workflows-enabled member ${randomUUID()}`,
        description: 'Member plus the WORKFLOWS permission flag',
        icon: 'IconSettingsAutomation',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    workflowsRoleId = createdRole.createOneRole.id;

    await upsertPermissionFlags({
      expectToFail: false,
      input: {
        roleId: workflowsRoleId,
        permissionFlagKeys: [PermissionFlagType.WORKFLOWS],
      },
    });

    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: workflowsRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });

    ({ coreWorkflowId, coreWorkflowVersionId, workspaceWorkflowId } =
      await createWorkflowWithLegacyIds('Private Workflow Access'));
  });

  afterAll(async () => {
    if (isDefined(coreWorkflowId)) {
      await setIsPrivate({ coreWorkflowId, isPrivate: false });
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }

    if (isDefined(workflowsRoleId)) {
      await updateWorkspaceMemberRole({
        expectToFail: false,
        input: {
          roleId: originalMemberRoleId,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        },
      });
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: workflowsRoleId },
      });
    }
  });

  describe('while the workflow is visible to the workspace', () => {
    it('lets another member read it', async () => {
      const response = await asOtherMember(CORE_WORKFLOW_BY_ID_QUERY, {
        coreWorkflowId,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.coreWorkflowById).toMatchObject({
        id: coreWorkflowId,
        isPrivate: false,
      });
    });

    it('tells another member they may not change the creator visibility', async () => {
      const response = await asOtherMember(CORE_WORKFLOW_BY_ID_QUERY, {
        coreWorkflowId,
      });

      expect(response.body.data.coreWorkflowById).toMatchObject({
        canChangeVisibility: false,
      });
    });
  });

  describe('an ownerless workflow', () => {
    let ownerlessCoreWorkflowId: string;

    beforeAll(async () => {
      ({ coreWorkflowId: ownerlessCoreWorkflowId } = await createCoreWorkflow({
        name: 'Ownerless Workflow',
      }));

      await global.testDataSource.query(
        `UPDATE core."workflow" SET "createdByUserWorkspaceId" = NULL WHERE id = $1`,
        [ownerlessCoreWorkflowId],
      );

      await recomputeAppleWorkflowCaches(['flatWorkflowMaps']);
    });

    afterAll(async () => {
      if (isDefined(ownerlessCoreWorkflowId)) {
        await deleteCoreWorkflows({
          coreWorkflowIds: [ownerlessCoreWorkflowId],
        });
      }
    });

    it('lets no member change its privacy', async () => {
      for (const requester of [workflowGraphqlRequest, asOtherMember]) {
        const response = await requester(CORE_WORKFLOW_BY_ID_QUERY, {
          coreWorkflowId: ownerlessCoreWorkflowId,
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.coreWorkflowById).toMatchObject({
          isPrivate: false,
          canChangeVisibility: false,
        });
      }
    });

    it('refuses to make it private', async () => {
      for (const requester of [workflowGraphqlRequest, asOtherMember]) {
        const response = await requester(UPDATE_CORE_WORKFLOW_MUTATION, {
          input: {
            coreWorkflowId: ownerlessCoreWorkflowId,
            isPrivate: true,
          },
        });

        expect(response.body.errors?.[0]?.extensions?.code).toBe(
          'METADATA_VALIDATION_FAILED',
        );
      }
    });

    it('accepts an update that keeps it shared, without making the caller its creator', async () => {
      const response = await asOtherMember(UPDATE_CORE_WORKFLOW_MUTATION, {
        input: {
          coreWorkflowId: ownerlessCoreWorkflowId,
          isPrivate: false,
        },
      });

      expect(response.body.errors).toBeUndefined();

      const afterUpdate = await asOtherMember(CORE_WORKFLOW_BY_ID_QUERY, {
        coreWorkflowId: ownerlessCoreWorkflowId,
      });

      expect(afterUpdate.body.data.coreWorkflowById).toMatchObject({
        isPrivate: false,
        canChangeVisibility: false,
      });
    });
  });

  describe('once its creator makes it private', () => {
    beforeAll(async () => {
      const response = await setIsPrivate({ coreWorkflowId, isPrivate: true });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateCoreWorkflow).toMatchObject({
        isPrivate: true,
      });
    });

    it('still lets its creator read it and change it back', async () => {
      const response = await workflowGraphqlRequest(CORE_WORKFLOW_BY_ID_QUERY, {
        coreWorkflowId,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.coreWorkflowById).toMatchObject({
        id: coreWorkflowId,
        isPrivate: true,
        canChangeVisibility: true,
      });
    });

    it('refuses to resolve it for another member', async () => {
      const response = await asOtherMember(CORE_WORKFLOW_BY_ID_QUERY, {
        coreWorkflowId,
      });

      expect(response.body.data?.coreWorkflowById ?? null).toBeNull();
    });

    it('keeps it out of the other member list while leaving it in its creator list', async () => {
      expect(await listCoreWorkflowIds(asOtherMember)).not.toContain(
        coreWorkflowId,
      );
      expect(await listCoreWorkflowIds(workflowGraphqlRequest)).toContain(
        coreWorkflowId,
      );
    });

    it('refuses its version to another member', async () => {
      const response = await asOtherMember(CORE_WORKFLOW_VERSION_BY_ID_QUERY, {
        coreWorkflowVersionId,
      });

      expect(response.body.data?.coreWorkflowVersionById ?? null).toBeNull();
    });

    it('returns no versions for a legacy id that no core workflow carries', async () => {
      await global.testDataSource.query(
        `UPDATE core."workflow" SET "workspaceWorkflowId" = NULL WHERE id = $1`,
        [coreWorkflowId],
      );

      await recomputeAppleWorkflowCaches(['flatWorkflowMaps']);

      try {
        const response = await asOtherMember(CORE_WORKFLOW_VERSIONS_QUERY, {
          workspaceWorkflowId,
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.coreWorkflowVersions).toEqual([]);
      } finally {
        await global.testDataSource.query(
          `UPDATE core."workflow" SET "workspaceWorkflowId" = $2 WHERE id = $1`,
          [coreWorkflowId, workspaceWorkflowId],
        );

        await recomputeAppleWorkflowCaches(['flatWorkflowMaps']);
      }
    });

    it('lists versions through their core workflow, not their legacy workflow id', async () => {
      await global.testDataSource.query(
        `UPDATE core."workflowVersion" SET "workflowId" = NULL WHERE "coreWorkflowId" = $1`,
        [coreWorkflowId],
      );

      await recomputeAppleWorkflowCaches(['flatWorkflowVersionMaps']);

      try {
        const response = await workflowGraphqlRequest(
          CORE_WORKFLOW_VERSIONS_QUERY,
          { workspaceWorkflowId },
        );

        expect(response.body.errors).toBeUndefined();
        expect(
          response.body.data.coreWorkflowVersions.map(
            ({ id }: { id: string }) => id,
          ),
        ).toContain(coreWorkflowVersionId);
      } finally {
        await global.testDataSource.query(
          `UPDATE core."workflowVersion" SET "workflowId" = $2 WHERE "coreWorkflowId" = $1`,
          [coreWorkflowId, workspaceWorkflowId],
        );

        await recomputeAppleWorkflowCaches(['flatWorkflowVersionMaps']);
      }
    });

    // This resolver reads version content straight from its id, bypassing the workflow lookup.
    it('refuses to compute a step output schema from its version for another member', async () => {
      const response = await asOtherMember(
        COMPUTE_STEP_OUTPUT_SCHEMA_MUTATION,
        {
          input: {
            step: { type: 'MANUAL', settings: { outputSchema: {} } },
            coreWorkflowVersionId,
          },
        },
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.computeStepOutputSchema ?? null).toBeNull();
    });

    it('refuses to run it for another member', async () => {
      const response = await asOtherMember(RUN_MUTATION, {
        input: { coreWorkflowVersionId },
      });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.runCoreWorkflowVersion ?? null).toBeNull();
    });

    describe('when another member sends an uppercased id', () => {
      it('refuses to resolve it', async () => {
        const response = await asOtherMember(CORE_WORKFLOW_BY_ID_QUERY, {
          coreWorkflowId: coreWorkflowId.toUpperCase(),
        });

        expect(response.body.data?.coreWorkflowById ?? null).toBeNull();
      });

      it('refuses to duplicate it', async () => {
        const response = await asOtherMember(DUPLICATE_CORE_WORKFLOW_MUTATION, {
          input: {
            coreWorkflowIdToDuplicate: coreWorkflowId.toUpperCase(),
            coreWorkflowVersionIdToCopy: coreWorkflowVersionId.toUpperCase(),
          },
        });

        expect(response.body.errors).toBeDefined();
        expect(response.body.data?.duplicateCoreWorkflow ?? null).toBeNull();
      });

      it('refuses to run it', async () => {
        const response = await asOtherMember(RUN_MUTATION, {
          input: { coreWorkflowVersionId: coreWorkflowVersionId.toUpperCase() },
        });

        expect(response.body.errors).toBeDefined();
        expect(response.body.data?.runCoreWorkflowVersion ?? null).toBeNull();
      });

      it('refuses to delete it', async () => {
        const response = await asOtherMember(DELETE_CORE_WORKFLOWS_MUTATION, {
          input: { coreWorkflowIds: [coreWorkflowId.toUpperCase()] },
        });

        expect(response.body.errors).toBeDefined();

        const creatorResponse = await workflowGraphqlRequest(
          CORE_WORKFLOW_BY_ID_QUERY,
          { coreWorkflowId },
        );

        expect(creatorResponse.body.data.coreWorkflowById).toMatchObject({
          id: coreWorkflowId,
        });
      });
    });

    it('refuses to let another member publish it back to the workspace', async () => {
      const response = await asOtherMember(UPDATE_CORE_WORKFLOW_MUTATION, {
        input: {
          coreWorkflowId,
          isPrivate: false,
        },
      });

      expect(response.body.errors).toBeDefined();

      const stillPrivate = await workflowGraphqlRequest(
        CORE_WORKFLOW_BY_ID_QUERY,
        { coreWorkflowId },
      );

      expect(stillPrivate.body.data.coreWorkflowById).toMatchObject({
        isPrivate: true,
      });
    });

    describe('lifecycle and draft edits on a private workflow', () => {
      const MANUAL_TRIGGER = {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      };

      let draftWorkflow: {
        coreWorkflowId: string;
        coreWorkflowVersionId: string;
      };
      let activeWorkflow: {
        coreWorkflowId: string;
        coreWorkflowVersionId: string;
      };

      const lifecycleService = () =>
        getAppProviderByClassName<CoreWorkflowLifecycleWorkspaceService>(
          'CoreWorkflowLifecycleWorkspaceService',
        );

      const validateCoreWorkflowVersionAs = ({
        userWorkspaceId,
        coreWorkflowVersionId,
      }: {
        userWorkspaceId: string;
        coreWorkflowVersionId: string;
      }) =>
        global.workflowTestServices.withWorkspaceAuthContext(
          buildUserAuthContext({
            workspace: { id: SEED_APPLE_WORKSPACE_ID } as NonNullable<
              RawAuthContext['workspace']
            >,
            userWorkspaceId,
            user: { id: userWorkspaceId } as NonNullable<
              RawAuthContext['user']
            >,
            workspaceMemberId: userWorkspaceId,
            workspaceMember: { id: userWorkspaceId } as NonNullable<
              RawAuthContext['workspaceMember']
            >,
            userSessionVariant: 'standard',
          }),
          () =>
            lifecycleService().validateCoreWorkflowVersion({
              workspaceId: SEED_APPLE_WORKSPACE_ID,
              coreWorkflowVersionId,
            }),
        );

      beforeAll(async () => {
        draftWorkflow = await createCoreWorkflow({
          name: 'Private Workflow Draft',
        });

        await updateCoreWorkflowVersionTrigger({
          coreWorkflowVersionId: draftWorkflow.coreWorkflowVersionId,
          trigger: MANUAL_TRIGGER,
        });
        await createCoreWorkflowVersionStep({
          coreWorkflowVersionId: draftWorkflow.coreWorkflowVersionId,
          stepType: 'FIND_RECORDS',
        });

        activeWorkflow = await createActiveManualWorkflow(
          'Private Workflow Active',
        );

        for (const { coreWorkflowId } of [draftWorkflow, activeWorkflow]) {
          const response = await setIsPrivate({
            coreWorkflowId,
            isPrivate: true,
          });

          expect(response.body.errors).toBeUndefined();
        }
      });

      afterAll(async () => {
        const coreWorkflowIds = [draftWorkflow, activeWorkflow]
          .filter(isDefined)
          .map(({ coreWorkflowId }) => coreWorkflowId);

        for (const coreWorkflowId of coreWorkflowIds) {
          await setIsPrivate({ coreWorkflowId, isPrivate: false });
        }

        await deleteCoreWorkflows({ coreWorkflowIds });
      });

      it('refuses to validate its version for another member', async () => {
        await expect(
          validateCoreWorkflowVersionAs({
            userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
            coreWorkflowVersionId: draftWorkflow.coreWorkflowVersionId,
          }),
        ).rejects.toThrow('is private to another member');
      });

      it('still validates its version for its creator', async () => {
        await expect(
          validateCoreWorkflowVersionAs({
            userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
            coreWorkflowVersionId: draftWorkflow.coreWorkflowVersionId,
          }),
        ).resolves.toBe(true);
      });

      it('refuses to activate its draft for another member', async () => {
        const response = await asOtherMember(
          `mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
            activateCoreWorkflowVersion(coreWorkflowVersionId: $coreWorkflowVersionId)
          }`,
          { coreWorkflowVersionId: draftWorkflow.coreWorkflowVersionId },
        );

        expect(response.body.errors).toBeDefined();

        const version = await findCoreWorkflowVersion({
          coreWorkflowVersionId: draftWorkflow.coreWorkflowVersionId,
        });

        expect(version.status).toBe('DRAFT');
      });

      it('refuses to deactivate its active version for another member', async () => {
        const response = await asOtherMember(
          `mutation DeactivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
            deactivateCoreWorkflowVersion(coreWorkflowVersionId: $coreWorkflowVersionId)
          }`,
          { coreWorkflowVersionId: activeWorkflow.coreWorkflowVersionId },
        );

        expect(response.body.errors).toBeDefined();

        const version = await findCoreWorkflowVersion({
          coreWorkflowVersionId: activeWorkflow.coreWorkflowVersionId,
        });

        expect(version.status).toBe('ACTIVE');
      });

      it('refuses to edit its draft trigger for another member', async () => {
        const response = await asOtherMember(
          `mutation UpdateCoreWorkflowVersionTrigger(
            $input: UpdateCoreWorkflowVersionTriggerInput!
          ) {
            updateCoreWorkflowVersionTrigger(input: $input) {
              trigger
            }
          }`,
          {
            input: {
              coreWorkflowVersionId: draftWorkflow.coreWorkflowVersionId,
              trigger: { ...MANUAL_TRIGGER, name: 'Renamed by another member' },
            },
          },
        );

        expect(response.body.errors).toBeDefined();

        const version = await findCoreWorkflowVersion({
          coreWorkflowVersionId: draftWorkflow.coreWorkflowVersionId,
        });

        expect(version.trigger).toMatchObject({ name: 'Manual Trigger' });
      });

      it('still lets its creator activate the draft', async () => {
        await activateCoreWorkflowVersion({
          coreWorkflowVersionId: draftWorkflow.coreWorkflowVersionId,
        });

        const version = await findCoreWorkflowVersion({
          coreWorkflowVersionId: draftWorkflow.coreWorkflowVersionId,
        });

        expect(version.status).toBe('ACTIVE');
      });
    });
  });

  describe('a visibility change sent through updateCoreWorkflow', () => {
    const INITIAL_NAME = 'Visibility Through Update';
    const RENAMED_NAME = 'Visibility Through Update Renamed';

    let updatedCoreWorkflowId: string;

    const readAsCreator = async () => {
      const response = await workflowGraphqlRequest(
        CORE_WORKFLOW_WITH_NAME_BY_ID_QUERY,
        { coreWorkflowId: updatedCoreWorkflowId },
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.coreWorkflowById;
    };

    beforeAll(async () => {
      ({ coreWorkflowId: updatedCoreWorkflowId } = await createCoreWorkflow({
        name: INITIAL_NAME,
      }));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    afterAll(async () => {
      if (isDefined(updatedCoreWorkflowId)) {
        await setIsPrivate({
          coreWorkflowId: updatedCoreWorkflowId,
          isPrivate: false,
        });
        await deleteCoreWorkflows({ coreWorkflowIds: [updatedCoreWorkflowId] });
      }
    });

    it('changes the visibility without a name', async () => {
      const response = await workflowGraphqlRequest(
        UPDATE_CORE_WORKFLOW_MUTATION,
        {
          input: {
            coreWorkflowId: updatedCoreWorkflowId,
            isPrivate: true,
          },
        },
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateCoreWorkflow).toMatchObject({
        id: updatedCoreWorkflowId,
        name: INITIAL_NAME,
        isPrivate: true,
      });
    });

    it('holds the new visibility in the cached workflow at once', async () => {
      const { flatWorkflowMaps } =
        await getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatWorkflowMaps']);

      const cachedFlatWorkflow = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: updatedCoreWorkflowId,
        flatEntityMaps: flatWorkflowMaps,
      });

      assertIsDefinedOrThrow(cachedFlatWorkflow);
      expect(cachedFlatWorkflow.isPrivate).toBe(true);
      expect(cachedFlatWorkflow.createdByUserWorkspaceId).not.toBeNull();
    });

    it('emits a workflow updated event carrying the visibility', async () => {
      const emitMetadataEvents = jest.spyOn(
        getAppProviderByClassName<MetadataEventEmitter>('MetadataEventEmitter'),
        'emitMetadataEvents',
      );

      const response = await workflowGraphqlRequest(
        UPDATE_CORE_WORKFLOW_MUTATION,
        {
          input: {
            coreWorkflowId: updatedCoreWorkflowId,
            isPrivate: false,
          },
        },
      );

      expect(response.body.errors).toBeUndefined();
      expect(emitMetadataEvents).toHaveBeenCalledTimes(1);
      expect(emitMetadataEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          metadataEvents: expect.arrayContaining([
            expect.objectContaining({
              type: 'updated',
              metadataName: 'workflow',
              recordId: updatedCoreWorkflowId,
              properties: expect.objectContaining({
                updatedFields: ['isPrivate'],
              }),
            }),
          ]),
        }),
      );
    });

    it('renames and changes the visibility in one call', async () => {
      const response = await workflowGraphqlRequest(
        UPDATE_CORE_WORKFLOW_MUTATION,
        {
          input: {
            coreWorkflowId: updatedCoreWorkflowId,
            name: RENAMED_NAME,
            isPrivate: true,
          },
        },
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateCoreWorkflow).toMatchObject({
        name: RENAMED_NAME,
        isPrivate: true,
      });
    });

    it('applies neither the name nor the visibility when another member is refused', async () => {
      await setIsPrivate({
        coreWorkflowId: updatedCoreWorkflowId,
        isPrivate: false,
      });

      const response = await asOtherMember(UPDATE_CORE_WORKFLOW_MUTATION, {
        input: {
          coreWorkflowId: updatedCoreWorkflowId,
          name: 'Renamed By Another Member',
          isPrivate: true,
        },
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'METADATA_VALIDATION_FAILED',
      );
      expect(await readAsCreator()).toMatchObject({
        name: RENAMED_NAME,
        isPrivate: false,
        canChangeVisibility: true,
      });
    });

    it('still lets another member rename a workspace-visible workflow', async () => {
      const response = await asOtherMember(UPDATE_CORE_WORKFLOW_MUTATION, {
        input: {
          coreWorkflowId: updatedCoreWorkflowId,
          name: INITIAL_NAME,
        },
      });

      expect(response.body.errors).toBeUndefined();
      expect(await readAsCreator()).toMatchObject({
        name: INITIAL_NAME,
        isPrivate: false,
        canChangeVisibility: true,
      });
    });
  });

  describe('an ownerless private workflow', () => {
    let ownerlessPrivateCoreWorkflowId: string;

    beforeAll(async () => {
      ({ coreWorkflowId: ownerlessPrivateCoreWorkflowId } =
        await createCoreWorkflow({ name: 'Ownerless Private Workflow' }));

      await global.testDataSource.query(
        `UPDATE core."workflow" SET "createdByUserWorkspaceId" = NULL, "isPrivate" = true WHERE id = $1`,
        [ownerlessPrivateCoreWorkflowId],
      );

      await recomputeAppleWorkflowCaches(['flatWorkflowMaps']);
    });

    afterAll(async () => {
      if (isDefined(ownerlessPrivateCoreWorkflowId)) {
        await global.testDataSource.query(
          `UPDATE core."workflow" SET "isPrivate" = false WHERE id = $1`,
          [ownerlessPrivateCoreWorkflowId],
        );

        await recomputeAppleWorkflowCaches(['flatWorkflowMaps']);

        await deleteCoreWorkflows({
          coreWorkflowIds: [ownerlessPrivateCoreWorkflowId],
        });
      }
    });

    it('is hidden from every member', async () => {
      for (const requester of [workflowGraphqlRequest, asOtherMember]) {
        const response = await requester(CORE_WORKFLOW_BY_ID_QUERY, {
          coreWorkflowId: ownerlessPrivateCoreWorkflowId,
        });

        expect(response.body.data?.coreWorkflowById ?? null).toBeNull();
        expect(await listCoreWorkflowIds(requester)).not.toContain(
          ownerlessPrivateCoreWorkflowId,
        );
      }
    });
  });

  // Activating a manual trigger writes a workspace-wide command menu item carrying the workflow name.
  describe('a workflow with an active manual trigger', () => {
    let manualCoreWorkflowId: string;
    let manualCoreWorkflowVersionId: string;

    const listCommandMenuItemCoreWorkflowVersionIds = async (token: string) => {
      const { data } = await findCommandMenuItems({
        expectToFail: false,
        gqlFields: 'id coreWorkflowVersionId',
        input: undefined,
        token,
      });

      return data.commandMenuItems.map(
        (commandMenuItem) => commandMenuItem.coreWorkflowVersionId,
      );
    };

    beforeAll(async () => {
      ({
        coreWorkflowId: manualCoreWorkflowId,
        coreWorkflowVersionId: manualCoreWorkflowVersionId,
      } = await createActiveManualWorkflow('Manual Trigger Workflow'));
    });

    afterAll(async () => {
      if (isDefined(manualCoreWorkflowId)) {
        await setIsPrivate({
          coreWorkflowId: manualCoreWorkflowId,
          isPrivate: false,
        });
        await deleteCoreWorkflows({ coreWorkflowIds: [manualCoreWorkflowId] });
      }
    });

    it('puts its command menu item in every member command menu', async () => {
      expect(
        await listCommandMenuItemCoreWorkflowVersionIds(
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        ),
      ).toContain(manualCoreWorkflowVersionId);
    });

    it('takes the item out of the other member command menu once private, and leaves it in its creator one', async () => {
      const response = await setIsPrivate({
        coreWorkflowId: manualCoreWorkflowId,
        isPrivate: true,
      });

      expect(response.body.errors).toBeUndefined();

      expect(
        await listCommandMenuItemCoreWorkflowVersionIds(
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        ),
      ).not.toContain(manualCoreWorkflowVersionId);
      expect(
        await listCommandMenuItemCoreWorkflowVersionIds(
          APPLE_JANE_ADMIN_ACCESS_TOKEN,
        ),
      ).toContain(manualCoreWorkflowVersionId);
    });
  });

  // An agent step's conversation belongs to its recipient, or else the workflow's creator, whatever the workflow's visibility.
  describe('the conversation an agent step records on a run', () => {
    let conversationCoreWorkflowId: string;
    let workflowRunId: string;
    let threadId: string;

    const readConversation = (accessToken: string) =>
      metadataRequestAs(
        accessToken,
        `
          query ReadRunConversation($threadId: UUID!) {
            chatThread(id: $threadId) {
              id
              title
            }
            chatMessages(threadId: $threadId) {
              role
            }
          }
        `,
        { threadId },
      );

    beforeAll(async () => {
      let conversationCoreWorkflowVersionId: string;

      ({
        coreWorkflowId: conversationCoreWorkflowId,
        coreWorkflowVersionId: conversationCoreWorkflowVersionId,
      } = await createActiveManualWorkflow('Workflow With A Conversation'));

      workflowRunId = await runCoreWorkflowVersion({
        coreWorkflowVersionId: conversationCoreWorkflowVersionId,
      });

      const conversationService =
        getAppProviderByClassName<WorkflowAgentConversationWorkspaceService>(
          'WorkflowAgentConversationWorkspaceService',
        );

      ({ threadId } = await conversationService.openConversation({
        runInfo: { workspaceId: SEED_APPLE_WORKSPACE_ID, workflowRunId },
        stepId: 'trigger',
        title: 'Summarize the lead',
        recipientWorkspaceMemberId: null,
        threadKey: `${workflowRunId}:trigger`,
      }));

      const runConversationService =
        getAppProviderByClassName<AgentRunConversationService>(
          'AgentRunConversationService',
        );

      const openedTurn = await runConversationService.openTurn({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        threadId,
        agentId: null,
        senderUserWorkspaceId: null,
        senderApplicationId: null,
        messages: [{ role: 'user', content: 'Summarize the lead' }],
        createdBy: await conversationService.findTurnCreatedBy({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          workflowRunId,
        }),
      });

      assertIsDefinedOrThrow(openedTurn);

      const { turnId } = openedTurn;

      await getAppProviderByClassName<AgentConversationWriterService>(
        'AgentConversationWriterService',
      ).upsertAssistantMessage({
        agentId: null,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        id: randomUUID(),
        threadId,
        turnId,
        parts: [{ type: 'text', text: 'A warm lead.' }],
      });
      await getAppProviderByClassName<AgentTurnRecorderService>(
        'AgentTurnRecorderService',
      ).finish({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        turnId,
        status: AgentTurnStatus.COMPLETED,
      });
    });

    afterAll(async () => {
      if (isDefined(conversationCoreWorkflowId)) {
        await setIsPrivate({
          coreWorkflowId: conversationCoreWorkflowId,
          isPrivate: false,
        });
        await deleteCoreWorkflows({
          coreWorkflowIds: [conversationCoreWorkflowId],
        });
      }
    });

    it('records the conversation, which holds the prompt and the reply', async () => {
      const response = await readConversation(APPLE_JANE_ADMIN_ACCESS_TOKEN);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.chatThread.title).toBe('Summarize the lead');
      expect(
        response.body.data.chatMessages.map(
          ({ role }: { role: string }) => role,
        ),
      ).toEqual(['user', 'assistant']);
    });

    it("files it under done in the workflow creator's chats", async () => {
      expect(await listChatThreadIds(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toContain(
        threadId,
      );

      const [{ archivedAt }] = await global.testDataSource.query(
        `SELECT "archivedAt" FROM "${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."agentChatThreadParticipant" WHERE "threadId" = $1`,
        [threadId],
      );

      expect(archivedAt).not.toBeNull();
    });

    it('keeps it private to its owner even when the workflow is visible', async () => {
      const response = await readConversation(APPLE_JONY_MEMBER_ACCESS_TOKEN);

      expect(response.body.data?.chatThread ?? null).toBeNull();
      expect(response.body.errors).toBeDefined();
    });
  });

  // Removing a member deletes the membership, which nulls the creator of every workflow they created.
});
