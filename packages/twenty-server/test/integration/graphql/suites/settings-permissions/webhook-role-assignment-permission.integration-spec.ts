import gql from 'graphql-tag';
import request from 'supertest';
import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

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

const DELETE_WEBHOOK = gql`
  mutation DeleteWebhook($id: UUID!) {
    deleteWebhook(id: $id) {
      id
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
    roleId?: string;
    token?: string;
  }) => {
    const response = await makeMetadataApiRequest(
      {
        query: CREATE_WEBHOOK,
        variables: {
          input: {
            targetUrl: 'https://example.com/webhook',
            operations: ['*.*'],
            roleId,
          },
        },
      },
      token,
    );

    const webhookId = response.body.data?.createWebhook?.id;

    if (isDefined(webhookId)) {
      webhookIds.push(webhookId);
    }

    return response;
  };

  const updateWebhookAs = ({
    webhookId,
    update,
    token,
  }: {
    webhookId: string;
    update: Record<string, unknown>;
    token?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: UPDATE_WEBHOOK,
        variables: { input: { id: webhookId, update } },
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
        query: DELETE_WEBHOOK,
        variables: { id: webhookId },
      });
    }

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(deleteOneRoleOperationFactory(customRoleId));
  });

  it('rejects creating a webhook without a role', async () => {
    const response = await createWebhookAs({});

    expect(response.body.data?.createWebhook ?? null).toBeNull();
    expect(response.body.errors).toBeDefined();
  });

  it('rejects creating a webhook with an unknown role', async () => {
    const response = await createWebhookAs({
      roleId: '20202020-0000-4000-8000-000000000000',
    });

    expect(response.body.data?.createWebhook ?? null).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });

  it('denies creating a webhook when the caller lacks ROLES permission', async () => {
    const response = await createWebhookAs({
      roleId: adminRoleId,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.data?.createWebhook ?? null).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('denies editing a webhook when the caller lacks ROLES permission', async () => {
    const createResponse = await createWebhookAs({ roleId: adminRoleId });
    const webhookId = createResponse.body.data.createWebhook.id;

    const response = await updateWebhookAs({
      webhookId,
      update: { targetUrl: 'https://attacker.example.com/webhook' },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('denies creating a webhook through REST when the caller lacks ROLES permission', async () => {
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

  it('denies editing a webhook through REST when the caller lacks ROLES permission', async () => {
    const createResponse = await createWebhookAs({ roleId: adminRoleId });
    const webhookId = createResponse.body.data.createWebhook.id;

    const response = await makeRestApiRequest({
      method: 'patch',
      path: `/webhooks/${webhookId}`,
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      body: { targetUrl: 'https://attacker.example.com/webhook' },
    });

    expect(response.body.code).toBe('PERMISSION_DENIED');

    const webhooks = await testDataSource.query(
      'SELECT "targetUrl" FROM core."webhook" WHERE id = $1',
      [webhookId],
    );

    expect(webhooks).toEqual([{ targetUrl: 'https://example.com/webhook' }]);
  });

  it('assigns and changes the role of a webhook with ROLES permission', async () => {
    const createResponse = await createWebhookAs({ roleId: adminRoleId });

    expect(createResponse.body.errors).toBeUndefined();
    expect(createResponse.body.data.createWebhook.role.id).toBe(adminRoleId);

    const changeResponse = await updateWebhookAs({
      webhookId: createResponse.body.data.createWebhook.id,
      update: { roleId: customRoleId },
    });

    expect(changeResponse.body.errors).toBeUndefined();
    expect(changeResponse.body.data.updateWebhook.role.id).toBe(customRoleId);
  });

  it('deletes the role assignment along with the webhook', async () => {
    const createResponse = await createWebhookAs({ roleId: adminRoleId });
    const webhookId = createResponse.body.data.createWebhook.id;

    await makeMetadataApiRequest({
      query: DELETE_WEBHOOK,
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
