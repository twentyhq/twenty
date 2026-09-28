import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { pollWorkflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/poll-workflow-graphql-request.util';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
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

const asApiKey = (query: string, variables?: object) =>
  graphqlRequestAs(API_KEY_ACCESS_TOKEN, query, variables);

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

const CORE_WORKFLOW_VERSION_QUERY = `
  query CoreWorkflowVersion($workspaceWorkflowVersionId: UUID!) {
    coreWorkflowVersion(
      workspaceWorkflowVersionId: $workspaceWorkflowVersionId
    ) {
      id
      steps
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

const LEGACY_RUN_MUTATION = `
  mutation RunWorkflowVersion($input: RunWorkflowVersionInput!) {
    runWorkflowVersion(input: $input) {
      workflowRunId
    }
  }
`;

const CREATE_CORE_WORKFLOW_MUTATION = `
  mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {
    createCoreWorkflow(input: $input) {
      id
      workspaceWorkflowId
    }
  }
`;

const ACTIVATE_VERSION_MUTATION = `
  mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
    activateWorkflowVersion(workflowVersionId: $workflowVersionId)
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

const DESTROY_WORKFLOW_MUTATION = `
  mutation DestroyWorkflow($id: UUID!) {
    destroyWorkflow(id: $id) {
      id
    }
  }
`;

const createActiveManualWorkflow = async (name: string) => {
  const createResponse = await workflowGraphqlRequest(
    CREATE_CORE_WORKFLOW_MUTATION,
    { input: { name } },
  );

  expect(createResponse.body.errors).toBeUndefined();

  const coreWorkflowId: string = createResponse.body.data.createCoreWorkflow.id;
  const workspaceWorkflowId: string =
    createResponse.body.data.createCoreWorkflow.workspaceWorkflowId;

  const versions = await pollWorkflowGraphqlRequest<
    {
      coreWorkflowVersions: { workspaceWorkflowVersionId: string | null }[];
    },
    { workspaceWorkflowVersionId: string | null }[] | undefined
  >({
    query: `
      query CoreWorkflowVersions($workspaceWorkflowId: UUID!) {
        coreWorkflowVersions(workspaceWorkflowId: $workspaceWorkflowId) {
          workspaceWorkflowVersionId
        }
      }
    `,
    variables: { workspaceWorkflowId },
    extract: (data) => data?.coreWorkflowVersions,
    until: (coreWorkflowVersions) =>
      isDefined(coreWorkflowVersions?.[0]?.workspaceWorkflowVersionId),
  });

  const workspaceWorkflowVersionId = versions![0].workspaceWorkflowVersionId!;

  await updateWorkflowVersionTrigger({
    workflowVersionId: workspaceWorkflowVersionId,
    trigger: {
      name: 'Manual Trigger',
      type: 'MANUAL',
      settings: { outputSchema: {} },
      nextStepIds: [],
      position: { x: 0, y: 0 },
    },
  });

  const stepResponse = await workflowGraphqlRequest(
    `
      mutation CreateWorkflowVersionStep(
        $input: CreateWorkflowVersionStepInput!
      ) {
        createWorkflowVersionStep(input: $input) {
          stepsDiff
        }
      }
    `,
    {
      input: {
        workflowVersionId: workspaceWorkflowVersionId,
        stepType: 'FIND_RECORDS',
        parentStepId: 'trigger',
        position: { x: 200, y: 0 },
      },
    },
  );

  expect(stepResponse.body.errors).toBeUndefined();

  const activateResponse = await workflowGraphqlRequest(
    ACTIVATE_VERSION_MUTATION,
    { workflowVersionId: workspaceWorkflowVersionId },
  );

  expect(activateResponse.body.errors).toBeUndefined();

  return { coreWorkflowId, workspaceWorkflowId, workspaceWorkflowVersionId };
};

// The generic record API, which the run and version pages read, rather than
// the core workflow API that #26243 already gates.
const findRecordIds = async (
  requester: (query: string, variables?: object) => request.Test,
  objectNamePlural: 'workflows' | 'workflowRuns' | 'workflowVersions',
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
  let workspaceWorkflowId: string;
  let coreWorkflowId: string;
  let workspaceWorkflowVersionId: string;
  let originalMemberRoleId: string;
  let workflowsRoleId: string;

  beforeAll(async () => {
    // The whole workflow API sits behind SettingsPermissionGuard(WORKFLOWS),
    // which the seeded Member role does not carry, so the second member has to
    // be someone who could reach the workflow if visibility allowed it.
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

    const createResponse = await workflowGraphqlRequest(
      CREATE_CORE_WORKFLOW_MUTATION,
      { input: { name: 'Private Workflow Access' } },
    );

    expect(createResponse.body.errors).toBeUndefined();
    coreWorkflowId = createResponse.body.data.createCoreWorkflow.id;
    workspaceWorkflowId =
      createResponse.body.data.createCoreWorkflow.workspaceWorkflowId;

    const versions = await pollWorkflowGraphqlRequest<
      {
        coreWorkflowVersions: { workspaceWorkflowVersionId: string | null }[];
      },
      { workspaceWorkflowVersionId: string | null }[] | undefined
    >({
      query: `
        query CoreWorkflowVersions($workspaceWorkflowId: UUID!) {
          coreWorkflowVersions(workspaceWorkflowId: $workspaceWorkflowId) {
            workspaceWorkflowVersionId
          }
        }
      `,
      variables: { workspaceWorkflowId },
      extract: (data) => data?.coreWorkflowVersions,
      until: (coreWorkflowVersions) =>
        isDefined(coreWorkflowVersions?.[0]?.workspaceWorkflowVersionId),
    });

    workspaceWorkflowVersionId = versions![0].workspaceWorkflowVersionId!;
  });

  afterAll(async () => {
    if (isDefined(workspaceWorkflowId)) {
      await setVisibility(coreWorkflowId, WorkflowVisibility.WORKSPACE);
      await workflowGraphqlRequest(
        `
          mutation DestroyWorkflow($id: UUID!) {
            destroyWorkflow(id: $id) {
              id
            }
          }
        `,
        { id: workspaceWorkflowId },
      );
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

  // Workflows predating the visibility column have no owner, and so does one
  // whose creator left the workspace, since the owner FK is ON DELETE SET NULL.
  // Without a claim they would be unreachable by everyone while still running.
  describe('an ownerless workflow', () => {
    let ownerlessWorkspaceWorkflowId: string;
    let ownerlessCoreWorkflowId: string;

    beforeAll(async () => {
      const createResponse = await workflowGraphqlRequest(`
        mutation {
          createWorkflow(data: { name: "Ownerless Workflow" }) {
            id
          }
        }
      `);

      expect(createResponse.body.errors).toBeUndefined();
      ownerlessWorkspaceWorkflowId = createResponse.body.data.createWorkflow.id;

      const coreWorkflow = await pollWorkflowGraphqlRequest<
        { coreWorkflow: { id: string } | null },
        { id: string } | null | undefined
      >({
        query: `
          query CoreWorkflow($workspaceWorkflowId: UUID!) {
            coreWorkflow(workspaceWorkflowId: $workspaceWorkflowId) {
              id
            }
          }
        `,
        variables: { workspaceWorkflowId: ownerlessWorkspaceWorkflowId },
        extract: (data) => data?.coreWorkflow,
        until: isDefined,
      });

      ownerlessCoreWorkflowId = coreWorkflow!.id;
    });

    afterAll(async () => {
      await workflowGraphqlRequest(
        `
          mutation DestroyWorkflow($id: UUID!) {
            destroyWorkflow(id: $id) {
              id
            }
          }
        `,
        { id: ownerlessWorkspaceWorkflowId },
      );
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

    // The claim is the UPDATE's own WHERE rather than a preceding read, so this
    // is what keeps two simultaneous claims from both passing.
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

    // The versions carry the whole definition, so reaching one by id has to
    // answer to the same rule as reaching the workflow.
    it('refuses its version to another member', async () => {
      const response = await asOtherMember(CORE_WORKFLOW_VERSION_QUERY, {
        workspaceWorkflowVersionId,
      });

      expect(response.body.data?.coreWorkflowVersion ?? null).toBeNull();
    });

    // The builder resolver reads a version's content straight from its id to
    // compute a schema, so it hands out the whole definition unless it answers
    // to the same rule.
    it('refuses to compute a step output schema from its version for another member', async () => {
      const response = await asOtherMember(
        COMPUTE_STEP_OUTPUT_SCHEMA_MUTATION,
        {
          input: {
            step: { type: 'MANUAL', settings: { outputSchema: {} } },
            workflowVersionId: workspaceWorkflowVersionId,
          },
        },
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.computeStepOutputSchema ?? null).toBeNull();
    });

    // The legacy resolver is keyed by the workspace mirror's ids and never
    // passes through CoreWorkflowIdResolutionService, so it needs the rule
    // reached from the other side or a held id still launches the workflow.
    it('refuses to run it from the legacy API for another member', async () => {
      const response = await asOtherMember(LEGACY_RUN_MUTATION, {
        input: { workflowVersionId: workspaceWorkflowVersionId },
      });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.runWorkflowVersion ?? null).toBeNull();
    });

    // WorkflowTriggerResolver carries no class-level UserAuthGuard, so unlike
    // the core workflow API an API key does reach this mutation, and the rule
    // has to hold for a caller that is a workspace rather than a person.
    it('refuses to activate it for an API key', async () => {
      const response = await asApiKey(ACTIVATE_VERSION_MUTATION, {
        workflowVersionId: workspaceWorkflowVersionId,
      });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.activateWorkflowVersion ?? null).toBeNull();
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

  // Activating a manual trigger writes a workspace-wide command menu item
  // carrying the workflow name, so the command menu is a second way to reach
  // the workflow and has to answer to the same rule.
  describe('a workflow with an active manual trigger', () => {
    let manualWorkspaceWorkflowId: string;
    let manualCoreWorkflowId: string;
    let manualWorkspaceWorkflowVersionId: string;

    const listCommandMenuItemWorkflowVersionIds = async (token: string) => {
      const { data } = await findCommandMenuItems({
        expectToFail: false,
        gqlFields: 'id workflowVersionId',
        input: undefined,
        token,
      });

      return data.commandMenuItems.map(
        ({ workflowVersionId }) => workflowVersionId,
      );
    };

    beforeAll(async () => {
      ({
        coreWorkflowId: manualCoreWorkflowId,
        workspaceWorkflowId: manualWorkspaceWorkflowId,
        workspaceWorkflowVersionId: manualWorkspaceWorkflowVersionId,
      } = await createActiveManualWorkflow('Manual Trigger Workflow'));
    });

    afterAll(async () => {
      if (isDefined(manualWorkspaceWorkflowId)) {
        await setVisibility(manualCoreWorkflowId, WorkflowVisibility.WORKSPACE);
        await workflowGraphqlRequest(
          `
            mutation DestroyWorkflow($id: UUID!) {
              destroyWorkflow(id: $id) {
                id
              }
            }
          `,
          { id: manualWorkspaceWorkflowId },
        );
      }
    });

    it('puts its command menu item in every member command menu', async () => {
      expect(
        await listCommandMenuItemWorkflowVersionIds(
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        ),
      ).toContain(manualWorkspaceWorkflowVersionId);
    });

    it('takes the item out of the other member command menu once private, and leaves it in its creator one', async () => {
      const response = await setVisibility(
        manualCoreWorkflowId,
        WorkflowVisibility.PRIVATE,
      );

      expect(response.body.errors).toBeUndefined();

      expect(
        await listCommandMenuItemWorkflowVersionIds(
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        ),
      ).not.toContain(manualWorkspaceWorkflowVersionId);
      expect(
        await listCommandMenuItemWorkflowVersionIds(
          APPLE_JANE_ADMIN_ACCESS_TOKEN,
        ),
      ).toContain(manualWorkspaceWorkflowVersionId);
    });
  });

  // A run holds the workflow's inputs and step outputs, so it has to be as
  // private as the workflow even when read through the generic record API.
  describe('the runs and versions of a workflow', () => {
    let runsCoreWorkflowId: string;
    let runsWorkspaceWorkflowId: string;
    let runsWorkspaceWorkflowVersionId: string;
    let workflowRunId: string;

    beforeAll(async () => {
      ({
        coreWorkflowId: runsCoreWorkflowId,
        workspaceWorkflowId: runsWorkspaceWorkflowId,
        workspaceWorkflowVersionId: runsWorkspaceWorkflowVersionId,
      } = await createActiveManualWorkflow('Workflow With Runs'));

      const runResponse = await workflowGraphqlRequest(LEGACY_RUN_MUTATION, {
        input: { workflowVersionId: runsWorkspaceWorkflowVersionId },
      });

      expect(runResponse.body.errors).toBeUndefined();
      workflowRunId = runResponse.body.data.runWorkflowVersion.workflowRunId;
    });

    afterAll(async () => {
      if (isDefined(runsWorkspaceWorkflowId)) {
        await setVisibility(runsCoreWorkflowId, WorkflowVisibility.WORKSPACE);
        await workflowGraphqlRequest(DESTROY_WORKFLOW_MUTATION, {
          id: runsWorkspaceWorkflowId,
        });
      }
    });

    it('lets another member read them while the workflow is visible to the workspace', async () => {
      expect(
        await findRecordIds(asOtherMember, 'workflowRuns', workflowRunId),
      ).toEqual([workflowRunId]);
      expect(
        await findRecordIds(
          asOtherMember,
          'workflowVersions',
          runsWorkspaceWorkflowVersionId,
        ),
      ).toEqual([runsWorkspaceWorkflowVersionId]);
    });

    it('hides the workflow, its runs and its versions from another member once private', async () => {
      const response = await setVisibility(
        runsCoreWorkflowId,
        WorkflowVisibility.PRIVATE,
      );

      expect(response.body.errors).toBeUndefined();

      expect(
        await findRecordIds(
          asOtherMember,
          'workflows',
          runsWorkspaceWorkflowId,
        ),
      ).toEqual([]);
      expect(
        await findRecordIds(asOtherMember, 'workflowRuns', workflowRunId),
      ).toEqual([]);
      expect(
        await findRecordIds(
          asOtherMember,
          'workflowVersions',
          runsWorkspaceWorkflowVersionId,
        ),
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
      expect(
        await findRecordIds(
          workflowGraphqlRequest,
          'workflows',
          runsWorkspaceWorkflowId,
        ),
      ).toEqual([runsWorkspaceWorkflowId]);
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

  // An agent step's conversation carries no grants of its own: it is read
  // through its run, so it follows the workflow's visibility like the run does.
  describe('the conversation an agent step records on a run', () => {
    let conversationCoreWorkflowId: string;
    let conversationWorkspaceWorkflowId: string;
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
      let workspaceWorkflowVersionId: string;

      ({
        coreWorkflowId: conversationCoreWorkflowId,
        workspaceWorkflowId: conversationWorkspaceWorkflowId,
        workspaceWorkflowVersionId,
      } = await createActiveManualWorkflow('Workflow With A Conversation'));

      const runResponse = await workflowGraphqlRequest(LEGACY_RUN_MUTATION, {
        input: { workflowVersionId: workspaceWorkflowVersionId },
      });

      expect(runResponse.body.errors).toBeUndefined();
      workflowRunId = runResponse.body.data.runWorkflowVersion.workflowRunId;

      const conversationService =
        getAppProviderByClassName<WorkflowAgentConversationWorkspaceService>(
          'WorkflowAgentConversationWorkspaceService',
        );

      const recordedConversation = await conversationService.recordExecution({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workflowRunId,
        stepId: 'trigger',
        title: 'Summarize the lead',
        agentId: null,
        prompt: 'Summarize the lead',
        initiatorUserWorkspaceId: null,
        executionResult: {
          steps: [
            { content: [{ type: 'text', text: 'A warm lead.' }] },
          ] as AgentExecutionResult['steps'],
        },
      });

      expect(recordedConversation).not.toBeNull();
      threadId = recordedConversation!.threadId;
    });

    afterAll(async () => {
      if (isDefined(conversationWorkspaceWorkflowId)) {
        await setVisibility(
          conversationCoreWorkflowId,
          WorkflowVisibility.WORKSPACE,
        );
        await workflowGraphqlRequest(DESTROY_WORKFLOW_MUTATION, {
          id: conversationWorkspaceWorkflowId,
        });
      }
    });

    it('points the step at the conversation, which holds the prompt and the reply', async () => {
      const runResponse = await workflowGraphqlRequest(
        `
          query FindRun($id: UUID!) {
            workflowRun(filter: { id: { eq: $id } }) {
              state
            }
          }
        `,
        { id: workflowRunId },
      );

      expect(runResponse.body.errors).toBeUndefined();
      expect(
        runResponse.body.data.workflowRun.state.stepInfos.trigger.threadId,
      ).toBe(threadId);

      const response = await readConversation(APPLE_JANE_ADMIN_ACCESS_TOKEN);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.chatThread.title).toBe('Summarize the lead');
      expect(
        response.body.data.chatMessages.map(
          ({ role }: { role: string }) => role,
        ),
      ).toEqual(['user', 'assistant']);
    });

    it('keeps it out of the chat list of someone who can read it', async () => {
      const response = await metadataRequestAs(
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
        'query ReadableThreads { chatThreads { id } }',
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.chatThreads.map(({ id }: { id: string }) => id),
      ).not.toContain(threadId);
    });

    it('refuses to rename it or add to it, even for the workflow creator', async () => {
      const renameResponse = await metadataRequestAs(
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
        `
          mutation RenameRunConversation($threadId: UUID!) {
            renameChatThread(id: $threadId, title: "Renamed") {
              id
            }
          }
        `,
        { threadId },
      );

      expect(renameResponse.body.errors?.[0]?.extensions?.code).toBe(
        'FORBIDDEN',
      );

      const archiveResponse = await metadataRequestAs(
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
        `
          mutation ArchiveRunConversation($threadId: UUID!) {
            archiveChatThread(id: $threadId) {
              id
            }
          }
        `,
        { threadId },
      );

      expect(archiveResponse.body.errors?.[0]?.extensions?.code).toBe(
        'FORBIDDEN',
      );
    });

    it('follows the workflow visibility for another member', async () => {
      const whileVisible = await readConversation(
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(whileVisible.body.errors).toBeUndefined();
      expect(whileVisible.body.data.chatThread.id).toBe(threadId);

      const response = await setVisibility(
        conversationCoreWorkflowId,
        WorkflowVisibility.PRIVATE,
      );

      expect(response.body.errors).toBeUndefined();

      const whilePrivate = await readConversation(
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(whilePrivate.body.data?.chatThread ?? null).toBeNull();
      expect(whilePrivate.body.errors).toBeDefined();

      const asCreator = await readConversation(APPLE_JANE_ADMIN_ACCESS_TOKEN);

      expect(asCreator.body.errors).toBeUndefined();
      expect(asCreator.body.data.chatThread.id).toBe(threadId);
    });
  });

  // An Ask has no grants of its own either: whoever reads the run reads its
  // questions, and nobody else.
  describe('the Ask an agent question records on a run', () => {
    let askCoreWorkflowId: string;
    let askWorkspaceWorkflowId: string;
    let threadId: string;

    const QUESTIONS = [
      {
        header: 'Quote',
        question: 'Send the quote to the customer?',
        options: [{ label: 'Send it' }, { label: 'Hold it' }],
      },
    ];

    const readAsks = async (
      requester: (query: string, variables?: object) => request.Test,
    ) => {
      const response = await requester(
        `
          query ReadAsks($threadId: UUID!) {
            inputAsks(filter: { threadId: { eq: $threadId } }) {
              edges {
                node {
                  id
                  status
                }
              }
            }
          }
        `,
        { threadId },
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.inputAsks.edges;
    };

    beforeAll(async () => {
      let workspaceWorkflowVersionId: string;

      ({
        coreWorkflowId: askCoreWorkflowId,
        workspaceWorkflowId: askWorkspaceWorkflowId,
        workspaceWorkflowVersionId,
      } = await createActiveManualWorkflow('Workflow With A Question'));

      const runResponse = await workflowGraphqlRequest(LEGACY_RUN_MUTATION, {
        input: { workflowVersionId: workspaceWorkflowVersionId },
      });

      expect(runResponse.body.errors).toBeUndefined();

      const askRunId: string =
        runResponse.body.data.runWorkflowVersion.workflowRunId;
      const [{ state }] = await global.testDataSource.query(
        `SELECT state FROM "${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."workflowRun" WHERE id = $1`,
        [askRunId],
      );
      const askStepId = state.flow.steps[0].id as string;

      const conversationService =
        getAppProviderByClassName<WorkflowAgentConversationWorkspaceService>(
          'WorkflowAgentConversationWorkspaceService',
        );

      const recordedConversation = await conversationService.recordExecution({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workflowRunId: askRunId,
        stepId: askStepId,
        title: 'Draft the quote',
        agentId: null,
        prompt: 'Draft the quote',
        initiatorUserWorkspaceId: null,
        executionResult: {
          isPaused: true,
          steps: [
            {
              content: [
                {
                  type: 'tool-call',
                  toolCallId: 'ask-1',
                  toolName: 'ask_questions',
                  input: { questions: QUESTIONS },
                },
                {
                  type: 'tool-result',
                  toolCallId: 'ask-1',
                  toolName: 'ask_questions',
                  input: { questions: QUESTIONS },
                  output: {
                    success: true,
                    message: 'Awaiting an answer.',
                    result: { questions: QUESTIONS, status: 'pending' },
                  },
                },
              ],
            },
          ] as AgentExecutionResult['steps'],
        },
      });

      expect(recordedConversation?.isAwaitingAnswer).toBe(true);
      threadId = recordedConversation!.threadId;
    });

    afterAll(async () => {
      if (isDefined(askWorkspaceWorkflowId)) {
        await setVisibility(askCoreWorkflowId, WorkflowVisibility.WORKSPACE);
        await workflowGraphqlRequest(DESTROY_WORKFLOW_MUTATION, {
          id: askWorkspaceWorkflowId,
        });
      }
    });

    it('is readable by another member while the workflow is visible to the workspace', async () => {
      expect(
        (await setVisibility(askCoreWorkflowId, WorkflowVisibility.WORKSPACE))
          .body.errors,
      ).toBeUndefined();
      // Its status depends on whether the run has finished meanwhile, which
      // has nothing to do with who may read it.
      expect(await readAsks(asOtherMember)).toHaveLength(1);
    });

    it('is hidden from another member once the workflow is private, but not from its creator', async () => {
      expect(
        (await setVisibility(askCoreWorkflowId, WorkflowVisibility.PRIVATE))
          .body.errors,
      ).toBeUndefined();
      expect(await readAsks(asOtherMember)).toEqual([]);
      expect(await readAsks(workflowGraphqlRequest)).toHaveLength(1);
    });
  });

  // An API key has to name whom a new private record is shared with, and the
  // workflow create hook names everyone on its behalf. That grant is not the
  // one the visibility sync writes, so the sync has to withdraw it as well.
  describe('a workflow created by an API key through the record API', () => {
    const apiKeyWorkflowId = randomUUID();
    let apiKeyCoreWorkflowId: string;

    beforeAll(async () => {
      const createResponse = await makeGraphqlApiRequestWithApiKey(
        createOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: 'id coreWorkflowId',
          data: { id: apiKeyWorkflowId, name: 'API Key Workflow' },
        }),
      );

      expect(createResponse.body.errors).toBeUndefined();
      expect(createResponse.body.data.createWorkflow.id).toBe(apiKeyWorkflowId);

      // The core workflow is written by the create post-query hook, after the
      // record has been returned.
      apiKeyCoreWorkflowId = (await pollWorkflowGraphqlRequest<
        { workflows: { edges: { node: { coreWorkflowId: string | null } }[] } },
        string | null | undefined
      >({
        query: `
          query ApiKeyWorkflow($id: UUID!) {
            workflows(filter: { id: { eq: $id } }) {
              edges {
                node {
                  coreWorkflowId
                }
              }
            }
          }
        `,
        variables: { id: apiKeyWorkflowId },
        extract: (data) => data?.workflows.edges[0]?.node.coreWorkflowId,
        until: (coreWorkflowId) => isDefined(coreWorkflowId),
      }))!;
    });

    afterAll(async () => {
      if (isDefined(apiKeyCoreWorkflowId)) {
        await setVisibility(apiKeyCoreWorkflowId, WorkflowVisibility.WORKSPACE);
      }
      await workflowGraphqlRequest(DESTROY_WORKFLOW_MUTATION, {
        id: apiKeyWorkflowId,
      });
    });

    it('is visible to every member', async () => {
      expect(
        await findRecordIds(asOtherMember, 'workflows', apiKeyWorkflowId),
      ).toEqual([apiKeyWorkflowId]);
    });

    it('is hidden from another member once whoever claims it makes it private', async () => {
      const response = await setVisibility(
        apiKeyCoreWorkflowId,
        WorkflowVisibility.PRIVATE,
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        await findRecordIds(asOtherMember, 'workflows', apiKeyWorkflowId),
      ).toEqual([]);
      expect(
        await findRecordIds(
          workflowGraphqlRequest,
          'workflows',
          apiKeyWorkflowId,
        ),
      ).toEqual([apiKeyWorkflowId]);
    });
  });
});
