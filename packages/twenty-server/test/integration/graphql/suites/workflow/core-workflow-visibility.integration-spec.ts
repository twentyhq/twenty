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

import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

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
      // The API key's creator role grant would keep every member holding
      // that role reading the workflow and its runs.
      expect(
        await global.testDataSource.query(
          `SELECT "principalType", "rowCause" FROM "${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."recordShare" WHERE "recordId" = $1`,
          [apiKeyWorkflowId],
        ),
      ).toEqual([{ principalType: 'WORKSPACE_MEMBER', rowCause: 'OWNER' }]);
      expect(
        await findRecordIds(
          workflowGraphqlRequest,
          'workflows',
          apiKeyWorkflowId,
        ),
      ).toEqual([apiKeyWorkflowId]);
    });
  });

  // Removing a member deletes their membership, and the database then clears
  // the creator of every workflow they created.
  describe('a private workflow whose creator is removed from the workspace', () => {
    const removedUserId = randomUUID();
    const removedUserWorkspaceId = randomUUID();
    let orphanedWorkflowId: string;
    let orphanedCoreWorkflowId: string;

    beforeAll(async () => {
      const createResponse = await workflowGraphqlRequest(
        CREATE_CORE_WORKFLOW_MUTATION,
        { input: { name: 'Workflow Of A Removed Member' } },
      );

      expect(createResponse.body.errors).toBeUndefined();
      orphanedCoreWorkflowId = createResponse.body.data.createCoreWorkflow.id;
      orphanedWorkflowId =
        createResponse.body.data.createCoreWorkflow.workspaceWorkflowId;

      expect(
        (
          await setVisibility(
            orphanedCoreWorkflowId,
            WorkflowVisibility.PRIVATE,
          )
        ).body.errors,
      ).toBeUndefined();

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
      if (isDefined(orphanedWorkflowId)) {
        await workflowGraphqlRequest(DESTROY_WORKFLOW_MUTATION, {
          id: orphanedWorkflowId,
        });
      }
      await global.testDataSource.query(
        `DELETE FROM core."userWorkspace" WHERE id = $1`,
        [removedUserWorkspaceId],
      );
      await global.testDataSource.query(
        `DELETE FROM core."user" WHERE id = $1`,
        [removedUserId],
      );
    });

    it('becomes readable to the workspace, as core now shows it', async () => {
      expect(
        await findRecordIds(asOtherMember, 'workflows', orphanedWorkflowId),
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
        await findRecordIds(asOtherMember, 'workflows', orphanedWorkflowId),
      ).toEqual([orphanedWorkflowId]);
    });
  });
});
