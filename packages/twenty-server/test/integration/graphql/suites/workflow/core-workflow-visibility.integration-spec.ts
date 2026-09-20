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
import { pollWorkflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/poll-workflow-graphql-request.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

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

const setVisibility = (coreWorkflowId: string, visibility: WorkflowVisibility) =>
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
});
