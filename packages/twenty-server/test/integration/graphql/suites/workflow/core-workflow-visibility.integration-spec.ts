import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { listChatThreadIds } from 'test/integration/utils/list-chat-thread-ids.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';
import {
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  CORE_WORKFLOW_VERSION_BY_ID_QUERY,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  RUN_CORE_WORKFLOW_VERSION_MUTATION,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { type AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { type WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';

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
      visibility
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

const COMPUTE_STEP_OUTPUT_SCHEMA_MUTATION = `
  mutation ComputeStepOutputSchema($input: ComputeStepOutputSchemaInput!) {
    computeStepOutputSchema(input: $input)
  }
`;

const UPDATE_VISIBILITY_MUTATION = `
  mutation UpdateCoreWorkflowVisibility(
    $input: UpdateCoreWorkflowVisibilityInput!
  ) {
    updateCoreWorkflowVisibility(input: $input) {
      id
      visibility
    }
  }
`;

const setVisibility = (
  coreWorkflowId: string,
  visibility: WorkflowVisibility,
) =>
  workflowGraphqlRequest(UPDATE_VISIBILITY_MUTATION, {
    input: { coreWorkflowId, visibility },
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

const createActiveManualWorkflow = async (name: string) => {
  const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
    name,
  });

  await updateCoreWorkflowVersionTrigger({
    coreWorkflowVersionId,
    trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
  });

  await createCoreWorkflowVersionStep({
    coreWorkflowVersionId,
    stepType: 'FIND_RECORDS',
  });

  await activateCoreWorkflowVersion(coreWorkflowVersionId);

  return { coreWorkflowId, coreWorkflowVersionId };
};

// The record API the run pages read, not the core workflow API #26243 already gates.
const findRecordIds = async (
  requester: (query: string, variables?: object) => request.Test,
  objectNamePlural: 'workflowRuns',
  id: string,
) => {
  const response = await requester(
    `
      query FindRecords($id: UUID!) {
        ${objectNamePlural}(filter: { id: { eq: $id } }) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    { id },
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data[objectNamePlural].edges.map(
    ({ node }: { node: { id: string } }) => node.id,
  );
};

describe('core workflow visibility (e2e)', () => {
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

    ({ coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'Private Workflow Access',
    }));
  });

  afterAll(async () => {
    if (isDefined(coreWorkflowId)) {
      await setVisibility(coreWorkflowId, WorkflowVisibility.WORKSPACE);
      await deleteCoreWorkflows([coreWorkflowId]);
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
        visibility: 'WORKSPACE',
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

  // Pre-visibility workflows and those whose creator left (owner FK is ON DELETE SET NULL) have no owner,
  // and without a claim nobody could reach them while they still run.
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
    });

    afterAll(async () => {
      if (isDefined(ownerlessCoreWorkflowId)) {
        await deleteCoreWorkflows([ownerlessCoreWorkflowId]);
      }
    });

    it('is claimable by any member who can already edit it', async () => {
      const response = await asOtherMember(CORE_WORKFLOW_BY_ID_QUERY, {
        coreWorkflowId: ownerlessCoreWorkflowId,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.coreWorkflowById).toMatchObject({
        canChangeVisibility: true,
      });
    });

    it('belongs to whoever claims it first, and only to them', async () => {
      const claim = await asOtherMember(UPDATE_VISIBILITY_MUTATION, {
        input: {
          coreWorkflowId: ownerlessCoreWorkflowId,
          visibility: WorkflowVisibility.WORKSPACE,
        },
      });

      expect(claim.body.errors).toBeUndefined();

      const asCreatorOfNothing = await workflowGraphqlRequest(
        CORE_WORKFLOW_BY_ID_QUERY,
        { coreWorkflowId: ownerlessCoreWorkflowId },
      );

      expect(asCreatorOfNothing.body.data.coreWorkflowById).toMatchObject({
        canChangeVisibility: false,
      });
    });

    // The claim is the UPDATE's own WHERE, which is what stops two simultaneous claims both passing.
    it('refuses a second claim even though the workflow is still workspace-visible', async () => {
      const secondClaim = await workflowGraphqlRequest(
        UPDATE_VISIBILITY_MUTATION,
        {
          input: {
            coreWorkflowId: ownerlessCoreWorkflowId,
            visibility: WorkflowVisibility.PRIVATE,
          },
        },
      );

      expect(secondClaim.body.errors).toBeDefined();

      const stillShared = await asOtherMember(CORE_WORKFLOW_BY_ID_QUERY, {
        coreWorkflowId: ownerlessCoreWorkflowId,
      });

      expect(stillShared.body.data.coreWorkflowById).toMatchObject({
        visibility: 'WORKSPACE',
        canChangeVisibility: true,
      });
    });
  });

  describe('once its creator makes it private', () => {
    beforeAll(async () => {
      const response = await setVisibility(
        coreWorkflowId,
        WorkflowVisibility.PRIVATE,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateCoreWorkflowVisibility).toMatchObject({
        visibility: 'PRIVATE',
      });
    });

    it('still lets its creator read it and change it back', async () => {
      const response = await workflowGraphqlRequest(CORE_WORKFLOW_BY_ID_QUERY, {
        coreWorkflowId,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.coreWorkflowById).toMatchObject({
        id: coreWorkflowId,
        visibility: 'PRIVATE',
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
      const response = await asOtherMember(RUN_CORE_WORKFLOW_VERSION_MUTATION, {
        input: { coreWorkflowVersionId },
      });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.runCoreWorkflowVersion ?? null).toBeNull();
    });

    it('refuses to let another member publish it back to the workspace', async () => {
      const response = await asOtherMember(UPDATE_VISIBILITY_MUTATION, {
        input: {
          coreWorkflowId,
          visibility: WorkflowVisibility.WORKSPACE,
        },
      });

      expect(response.body.errors).toBeDefined();

      const stillPrivate = await workflowGraphqlRequest(
        CORE_WORKFLOW_BY_ID_QUERY,
        { coreWorkflowId },
      );

      expect(stillPrivate.body.data.coreWorkflowById).toMatchObject({
        visibility: 'PRIVATE',
      });
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
        ({ coreWorkflowVersionId }) => coreWorkflowVersionId,
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
        await setVisibility(manualCoreWorkflowId, WorkflowVisibility.WORKSPACE);
        await deleteCoreWorkflows([manualCoreWorkflowId]);
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
      const response = await setVisibility(
        manualCoreWorkflowId,
        WorkflowVisibility.PRIVATE,
      );

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

  describe('the runs of a workflow', () => {
    let runsCoreWorkflowId: string;
    let runsCoreWorkflowVersionId: string;
    let workflowRunId: string;

    const runWorkflow = () =>
      runCoreWorkflowVersion({
        coreWorkflowVersionId: runsCoreWorkflowVersionId,
      });

    beforeAll(async () => {
      ({
        coreWorkflowId: runsCoreWorkflowId,
        coreWorkflowVersionId: runsCoreWorkflowVersionId,
      } = await createActiveManualWorkflow('Workflow With Runs'));

      workflowRunId = await runWorkflow();
    });

    afterAll(async () => {
      if (isDefined(runsCoreWorkflowId)) {
        await setVisibility(runsCoreWorkflowId, WorkflowVisibility.WORKSPACE);
        await deleteCoreWorkflows([runsCoreWorkflowId]);
      }
    });

    it('lets another member read them while the workflow is visible to the workspace', async () => {
      expect(
        await findRecordIds(asOtherMember, 'workflowRuns', workflowRunId),
      ).toEqual([workflowRunId]);
    });

    it('hides them from another member once the workflow is private', async () => {
      const response = await setVisibility(
        runsCoreWorkflowId,
        WorkflowVisibility.PRIVATE,
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        await findRecordIds(asOtherMember, 'workflowRuns', workflowRunId),
      ).toEqual([]);
    });

    it('keeps them readable by its creator while private', async () => {
      expect(
        await findRecordIds(
          workflowGraphqlRequest,
          'workflowRuns',
          workflowRunId,
        ),
      ).toEqual([workflowRunId]);
    });

    it('keeps a run started while private to its creator', async () => {
      const privateRunId = await runWorkflow();

      expect(
        await findRecordIds(asOtherMember, 'workflowRuns', privateRunId),
      ).toEqual([]);
      expect(
        await findRecordIds(
          workflowGraphqlRequest,
          'workflowRuns',
          privateRunId,
        ),
      ).toEqual([privateRunId]);
    });

    it('gives them back to another member once the workflow is visible to the workspace again', async () => {
      const response = await setVisibility(
        runsCoreWorkflowId,
        WorkflowVisibility.WORKSPACE,
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        await findRecordIds(asOtherMember, 'workflowRuns', workflowRunId),
      ).toEqual([workflowRunId]);
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

      const turnId = await runConversationService.openTurn({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        threadId,
        title: 'Summarize the lead',
        agentId: null,
        senderUserWorkspaceId: null,
        senderApplicationId: null,
        messages: [{ role: 'user', content: 'Summarize the lead' }],
        createdBy: await conversationService.findTurnCreatedBy({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          workflowRunId,
        }),
      });

      await runConversationService.closeTurn({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        threadId,
        turnId,
        title: 'Summarize the lead',
        agentId: null,
        execution: {
          steps: [
            { content: [{ type: 'text', text: 'A warm lead.' }] },
          ] as AgentExecutionResult['steps'],
        },
      });
    });

    afterAll(async () => {
      if (isDefined(conversationCoreWorkflowId)) {
        await setVisibility(
          conversationCoreWorkflowId,
          WorkflowVisibility.WORKSPACE,
        );
        await deleteCoreWorkflows([conversationCoreWorkflowId]);
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
  describe('the runs of a private workflow whose creator is removed from the workspace', () => {
    const removedUserId = randomUUID();
    const removedUserWorkspaceId = randomUUID();
    let orphanedCoreWorkflowId: string;
    let orphanedRunId: string;

    beforeAll(async () => {
      let orphanedCoreWorkflowVersionId: string;

      ({
        coreWorkflowId: orphanedCoreWorkflowId,
        coreWorkflowVersionId: orphanedCoreWorkflowVersionId,
      } = await createActiveManualWorkflow('Workflow Of A Removed Member'));

      expect(
        (
          await setVisibility(
            orphanedCoreWorkflowId,
            WorkflowVisibility.PRIVATE,
          )
        ).body.errors,
      ).toBeUndefined();

      orphanedRunId = await runCoreWorkflowVersion({
        coreWorkflowVersionId: orphanedCoreWorkflowVersionId,
      });

      await global.testDataSource.query(
        `INSERT INTO core."user" (id, email) VALUES ($1, $2)`,
        [removedUserId, `removed-${removedUserId}@apple.dev`],
      );
      await global.testDataSource.query(
        `INSERT INTO core."userWorkspace" (id, "userId", "workspaceId") VALUES ($1, $2, $3)`,
        [removedUserWorkspaceId, removedUserId, SEED_APPLE_WORKSPACE_ID],
      );
      await global.testDataSource.query(
        `UPDATE core."workflow" SET "createdByUserWorkspaceId" = $2 WHERE id = $1`,
        [orphanedCoreWorkflowId, removedUserWorkspaceId],
      );
    });

    afterAll(async () => {
      await global.testDataSource.query(
        `DELETE FROM core."userWorkspace" WHERE id = $1`,
        [removedUserWorkspaceId],
      );
      await global.testDataSource.query(
        `DELETE FROM core."user" WHERE id = $1`,
        [removedUserId],
      );
      if (isDefined(orphanedCoreWorkflowId)) {
        await deleteCoreWorkflows([orphanedCoreWorkflowId]);
      }
    });

    it('become readable to the workspace, as core now shows the workflow', async () => {
      expect(
        await findRecordIds(asOtherMember, 'workflowRuns', orphanedRunId),
      ).toEqual([]);

      await getAppProviderByClassName<UserWorkspaceService>(
        'UserWorkspaceService',
      ).deleteUserWorkspace({
        userWorkspaceId: removedUserWorkspaceId,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });

      const [coreWorkflow] = await global.testDataSource.query(
        `SELECT "createdByUserWorkspaceId" FROM core."workflow" WHERE id = $1`,
        [orphanedCoreWorkflowId],
      );

      expect(coreWorkflow.createdByUserWorkspaceId).toBeNull();
      expect(
        await findRecordIds(asOtherMember, 'workflowRuns', orphanedRunId),
      ).toEqual([orphanedRunId]);
    });
  });
});
