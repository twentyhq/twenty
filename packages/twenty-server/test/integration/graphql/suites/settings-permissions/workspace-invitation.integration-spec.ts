import request from 'supertest';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

describe('workspace invitation permissions', () => {
  it('should throw a permission error when user does not have permission to send invitation', async () => {
    const queryData = {
      query: `
        mutation sendWorkspaceInvitation {
          sendInvitations(emails: ["test@example.com"]) {
            success
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeNull();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
  });

  it('should throw a permission error when user does not have permission to resend invitation', async () => {
    const queryData = {
      query: `
        mutation resendWorkspaceInvitation {
          resendWorkspaceInvitation(appTokenId: "test-invitation-id") {
            success
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeNull();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
  });

  it('should throw a permission error when user does not have permission to find invitations', async () => {
    const queryData = {
      query: `
        query findWorkspaceInvitations {
          findWorkspaceInvitations {
            id
            email
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeNull();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
  });

  it('should throw a permission error when user does not have permission to delete invitation', async () => {
    const queryData = {
      query: `
        mutation deleteWorkspaceInvitation {
          deleteWorkspaceInvitation(appTokenId: "test-invitation-id") 
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeNull();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
  });
});
