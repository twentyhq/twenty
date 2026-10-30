import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import {
  createWebhook,
  deleteWebhook,
  updateWebhook,
} from 'test/integration/metadata/suites/utils/webhook-test.util';

const findRoleTargetRoleIdsOfWebhook = (webhookId: string) =>
  testDataSource.query(
    'SELECT "roleId" FROM core."roleTarget" WHERE "webhookId" = $1',
    [webhookId],
  );

describe('Webhook role assignment', () => {
  let adminRoleId: string;
  let otherRoleId: string;
  let webhookId: string;

  beforeAll(async () => {
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;

    const { data } = await createOneRole({
      input: {
        label: 'Webhook Role Assignment Role',
        canUpdateAllSettings: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    otherRoleId = data.createOneRole.id;
  });

  beforeEach(async () => {
    const response = await createWebhook({
      targetUrl: 'https://example.com/webhook',
      operations: ['*.*'],
      roleId: adminRoleId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createWebhook.role.id).toBe(adminRoleId);

    webhookId = response.body.data.createWebhook.id;
  });

  afterEach(async () => {
    await deleteWebhook(webhookId);
  });

  afterAll(async () => {
    await deleteOneRole({ input: { idToDelete: otherRoleId } });
  });

  it('changes the role of a webhook', async () => {
    const response = await updateWebhook({
      id: webhookId,
      update: { roleId: otherRoleId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWebhook.role.id).toBe(otherRoleId);
    expect(await findRoleTargetRoleIdsOfWebhook(webhookId)).toEqual([
      { roleId: otherRoleId },
    ]);
  });

  it('keeps the role when an update does not set one', async () => {
    const response = await updateWebhook({
      id: webhookId,
      update: { description: 'Updated description' },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWebhook.role.id).toBe(adminRoleId);
  });

  it('removes the role assignment along with the webhook', async () => {
    await deleteWebhook(webhookId);

    expect(await findRoleTargetRoleIdsOfWebhook(webhookId)).toEqual([]);
  });
});
