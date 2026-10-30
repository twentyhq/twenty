import gql from 'graphql-tag';
import request from 'supertest';
import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { PermissionFlagType } from 'twenty-shared/constants';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const CREATE_WEBHOOK = gql`
  mutation CreateWebhook($input: CreateWebhookInput!) {
    createWebhook(input: $input) {
      id
      role {
        id
      }
    }
  }
`;

const UPDATE_WEBHOOK = gql`
  mutation UpdateWebhook($input: UpdateWebhookInput!) {
    updateWebhook(input: $input) {
      id
      role {
        id
      }
    }
  }
`;

describe('Webhook role assignment permission', () => {
  let customRoleId: string;
  let adminRoleId: string;
  let originalMemberRoleId: string;
  const webhookIds: string[] = [];

  const createWebhookAs = async ({
    roleId,
    token,
  }: {
    roleId?: string | null;
    token?: string;
  }) => {
    const response = await makeMetadataApiRequest(
      {
        query: CREATE_WEBHOOK,
        variables: {
          input: {
            targetUrl: 'https://example.com/webhook',
            operations: ['*.*'],
            ...(roleId !== undefined && { roleId }),
          },
        },
      },
      token,
    );

    const webhookId = response.body.data?.createWebhook?.id;

    if (webhookId) {
      webhookIds.push(webhookId);
    }

    return response;
  };

  const updateWebhookRoleAs = ({
    webhookId,
    roleId,
    token,
  }: {
    webhookId: string;
    roleId: string | null;
    token?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: UPDATE_WEBHOOK,
        variables: { input: { id: webhookId, update: { roleId } } },
      },
      token,
    );

  beforeAll(async () => {
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;

    const createRoleResponse = await makeMetadataApiRequest({
      query: gql`
        mutation CreateOneRole {
          createOneRole(
            createRoleInput: {
              label: "Webhooks Only Role"
              canUpdateAllSettings: false
              canReadAllObjectRecords: true
              canUpdateAllObjectRecords: true
              canSoftDeleteAllObjectRecords: false
              canDestroyAllObjectRecords: false
            }
          ) {
            id
          }
        }
      `,
    });

    customRoleId = createRoleResponse.body.data.createOneRole.id;

    await makeMetadataApiRequest({
      query: gql`
        mutation UpsertPermissionFlags {
          upsertPermissionFlags(
            upsertPermissionFlagsInput: {
              roleId: "${customRoleId}"
              permissionFlagKeys: ["${PermissionFlagType.API_KEYS_AND_WEBHOOKS}"]
            }
          ) {
            id
          }
        }
      `,
    });

    await updateWorkspaceMemberRole({
      input: {
        roleId: customRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      input: {
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      expectToFail: false,
    });

    for (const webhookId of webhookIds) {
      await makeMetadataApiRequest({
        query: gql`
          mutation DeleteWebhook($id: UUID!) {
            deleteWebhook(id: $id) {
              id
            }
          }
        `,
        variables: { id: webhookId },
      });
    }

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(deleteOneRoleOperationFactory(customRoleId));
  });

  it('allows creating a webhook without a role when the caller lacks ROLES permission', async () => {
    const response = await createWebhookAs({
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createWebhook.role).toBeNull();
  });

  it('denies creating a webhook with a role when the caller lacks ROLES permission', async () => {
    const response = await createWebhookAs({
      roleId: adminRoleId,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.data?.createWebhook ?? null).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('denies changing the role of a webhook when the caller lacks ROLES permission', async () => {
    const createResponse = await createWebhookAs({ roleId: adminRoleId });
    const webhookId = createResponse.body.data.createWebhook.id;

    const response = await updateWebhookRoleAs({
      webhookId,
      roleId: null,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('allows creating a webhook with a null role when the caller lacks ROLES permission', async () => {
    const response = await createWebhookAs({
      roleId: null,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createWebhook.role).toBeNull();
  });

  it('denies creating a webhook with a role through REST when the caller lacks ROLES permission', async () => {
    const response = await makeRestApiRequest({
      method: 'post',
      path: '/webhooks',
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      body: {
        targetUrl: 'https://example.com/webhook',
        operations: ['*.*'],
        roleId: adminRoleId,
      },
    });

    expect(response.body.code).toBe('PERMISSION_DENIED');
  });

  it('denies changing the role of a webhook through REST when the caller lacks ROLES permission', async () => {
    const createResponse = await createWebhookAs({ roleId: adminRoleId });
    const webhookId = createResponse.body.data.createWebhook.id;

    const response = await makeRestApiRequest({
      method: 'patch',
      path: `/webhooks/${webhookId}`,
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      body: { roleId: null },
    });

    expect(response.body.code).toBe('PERMISSION_DENIED');

    const roleTargets = await testDataSource.query(
      'SELECT "roleId" FROM core."roleTarget" WHERE "webhookId" = $1',
      [webhookId],
    );

    expect(roleTargets).toEqual([{ roleId: adminRoleId }]);
  });

  it('assigns, changes and removes the role of a webhook with ROLES permission', async () => {
    const createResponse = await createWebhookAs({ roleId: adminRoleId });

    expect(createResponse.body.errors).toBeUndefined();
    expect(createResponse.body.data.createWebhook.role.id).toBe(adminRoleId);

    const webhookId = createResponse.body.data.createWebhook.id;

    const changeResponse = await updateWebhookRoleAs({
      webhookId,
      roleId: customRoleId,
    });

    expect(changeResponse.body.errors).toBeUndefined();
    expect(changeResponse.body.data.updateWebhook.role.id).toBe(customRoleId);

    const removeResponse = await updateWebhookRoleAs({
      webhookId,
      roleId: null,
    });

    expect(removeResponse.body.errors).toBeUndefined();
    expect(removeResponse.body.data.updateWebhook.role).toBeNull();
  });

  it('deletes the role assignment along with the webhook', async () => {
    const createResponse = await createWebhookAs({ roleId: adminRoleId });
    const webhookId = createResponse.body.data.createWebhook.id;

    await makeMetadataApiRequest({
      query: gql`
        mutation DeleteWebhook($id: UUID!) {
          deleteWebhook(id: $id) {
            id
          }
        }
      `,
      variables: { id: webhookId },
    });

    webhookIds.splice(webhookIds.indexOf(webhookId), 1);

    const roleTargets = await testDataSource.query(
      'SELECT id FROM core."roleTarget" WHERE "webhookId" = $1',
      [webhookId],
    );

    expect(roleTargets).toEqual([]);
  });
});
