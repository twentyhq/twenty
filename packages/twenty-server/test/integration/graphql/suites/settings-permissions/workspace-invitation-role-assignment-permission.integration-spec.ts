import gql from 'graphql-tag';
import request from 'supertest';
import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { sendInvitationsOperationFactory } from 'test/integration/graphql/utils/send-invitations-operation-factory.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { PermissionFlagType } from 'twenty-shared/constants';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

describe('Workspace invitation role assignment permission', () => {
  let customRoleId: string;
  let adminRoleId: string;
  let originalMemberRoleId: string;
  const invitedEmails: string[] = [];

  const sendInvitationsAs = async ({
    token,
    roleId,
  }: {
    token: string;
    roleId?: string;
  }) => {
    const email = `invitation-role-${Date.now()}-${invitedEmails.length}@example.com`;

    invitedEmails.push(email);

    const response = await makeMetadataApiRequest(
      sendInvitationsOperationFactory({ emails: [email], roleId }),
      token,
    );

    return { email, response };
  };

  beforeAll(async () => {
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;

    const createRoleResponse = await makeMetadataApiRequest({
      query: gql`
        mutation CreateOneRole {
          createOneRole(
            createRoleInput: {
              label: "Workspace Members Only Role"
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
              permissionFlagKeys: ["${PermissionFlagType.WORKSPACE_MEMBERS}"]
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

    for (const email of invitedEmails) {
      await deleteWorkspaceInvitationsByEmail({ email });
    }

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(deleteOneRoleOperationFactory(customRoleId));
  });

  it('denies inviting with the Admin role when the caller lacks ROLES permission', async () => {
    const { email, response } = await sendInvitationsAs({
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      roleId: adminRoleId,
    });

    expect(response.body.data?.sendInvitations ?? null).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    expect(await findWorkspaceInvitationsByEmail({ email })).toHaveLength(0);
  });

  it('allows inviting without a role when the caller only has WORKSPACE_MEMBERS permission', async () => {
    const { email, response } = await sendInvitationsAs({
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendInvitations.success).toBe(true);
    expect(await findWorkspaceInvitationsByEmail({ email })).toHaveLength(1);
  });

  it('allows inviting with a role when the caller has ROLES permission', async () => {
    const { email, response } = await sendInvitationsAs({
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      roleId: adminRoleId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendInvitations.success).toBe(true);
    expect(await findWorkspaceInvitationsByEmail({ email })).toHaveLength(1);
  });
});
