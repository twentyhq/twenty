import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import {
  createWebhook,
  deleteWebhook,
  updateWebhook,
} from 'test/integration/metadata/suites/utils/webhook-test.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import { PermissionFlagType } from 'twenty-shared/constants';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const WEBHOOK_TARGET_URL = 'https://example.com/webhook';
const ROLE_LESS_WEBHOOK_TARGET_URL = 'https://example.com/role-less-webhook';

describe('Webhook role assignment should fail', () => {
  let adminRoleId: string;
  let webhooksOnlyRoleId: string;
  let originalMemberRoleId: string;
  let webhookId: string;

  beforeAll(async () => {
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const { data } = await createOneRole({
      input: {
        label: 'Webhooks Only Role',
        canUpdateAllSettings: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    webhooksOnlyRoleId = data.createOneRole.id;

    await upsertPermissionFlags({
      input: {
        roleId: webhooksOnlyRoleId,
        permissionFlagKeys: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
      },
    });

    await updateWorkspaceMemberRole({
      input: {
        roleId: webhooksOnlyRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      expectToFail: false,
    });

    const response = await createWebhook({
      input: {
        targetUrl: WEBHOOK_TARGET_URL,
        operations: ['*.*'],
        roleId: adminRoleId,
      },
    });

    webhookId = response.body.data.createWebhook.id;
  });

  afterAll(async () => {
    await deleteWebhook({ id: webhookId });

    await updateWorkspaceMemberRole({
      input: {
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      expectToFail: false,
    });

    await deleteOneRole({ input: { idToDelete: webhooksOnlyRoleId } });
  });

  it('when creating a webhook without a role', async () => {
    const response = await createWebhook({
      input: {
        targetUrl: WEBHOOK_TARGET_URL,
        operations: ['*.*'],
        roleId: null,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });

  it('when creating a webhook through REST without a role', async () => {
    const response = await makeRestApiRequest({
      method: 'post',
      path: '/webhooks',
      body: {
        targetUrl: ROLE_LESS_WEBHOOK_TARGET_URL,
        operations: ['*.*'],
      },
    });

    expectOneNotInternalServerErrorHttpResponseSnapshot({
      status: response.status,
      body: response.body,
    });

    const webhooks = await testDataSource.query(
      'SELECT id FROM core."webhook" WHERE "targetUrl" = $1',
      [ROLE_LESS_WEBHOOK_TARGET_URL],
    );

    expect(webhooks).toEqual([]);
  });

  it('when creating a webhook with an unknown role', async () => {
    const response = await createWebhook({
      input: {
        targetUrl: WEBHOOK_TARGET_URL,
        operations: ['*.*'],
        roleId: '20202020-0000-4000-8000-000000000000',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });

  it('when creating a webhook without the ROLES permission', async () => {
    const response = await createWebhook({
      input: {
        targetUrl: WEBHOOK_TARGET_URL,
        operations: ['*.*'],
        roleId: adminRoleId,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });

  it('when editing a webhook without the ROLES permission', async () => {
    const response = await updateWebhook({
      input: {
        id: webhookId,
        update: { targetUrl: 'https://attacker.example.com/webhook' },
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });

  it('when creating a webhook through REST without the ROLES permission', async () => {
    const response = await makeRestApiRequest({
      method: 'post',
      path: '/webhooks',
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      body: {
        targetUrl: WEBHOOK_TARGET_URL,
        operations: ['*.*'],
        roleId: adminRoleId,
      },
    });

    expectOneNotInternalServerErrorHttpResponseSnapshot({
      status: response.status,
      body: response.body,
    });
  });

  it('when editing a webhook through REST without the ROLES permission', async () => {
    const response = await makeRestApiRequest({
      method: 'patch',
      path: `/webhooks/${webhookId}`,
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      body: { targetUrl: 'https://attacker.example.com/webhook' },
    });

    expectOneNotInternalServerErrorHttpResponseSnapshot({
      status: response.status,
      body: response.body,
    });

    const webhooks = await testDataSource.query(
      'SELECT "targetUrl" FROM core."webhook" WHERE id = $1',
      [webhookId],
    );

    expect(webhooks).toEqual([{ targetUrl: WEBHOOK_TARGET_URL }]);
  });
});
