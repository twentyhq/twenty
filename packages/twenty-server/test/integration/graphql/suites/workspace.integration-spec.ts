import request from 'supertest';
import { ADMIN_ACCESS_TOKEN } from 'test/integration/constants/admin-access-token.constants';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

describe('WorkspaceResolver', () => {
  beforeEach(async () => {
    const query = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      true,
    );

    await client.post('/graphql').send(query);
  });
  afterEach(async () => {
    const query = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      false,
    );

    await client.post('/graphql').send(query);
  });
  describe('security permissions', () => {
    it('should update workspace when user has permission (admin role)', async () => {
      const queryData = {
        query: `
        mutation updateWorkspace {
          updateWorkspace(data: { isMicrosoftAuthEnabled: false }) {
            id
            isMicrosoftAuthEnabled
          }
        }
      `,
      };

      return client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(queryData)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.errors).toBeUndefined();
        })
        .expect((res) => {
          const data = res.body.data.updateWorkspace;

          expect(data).toBeDefined();
          expect(data.isMicrosoftAuthEnabled).toBe(false);
        });
    });

    it('should throw a permission error when user does not have permission (no admin role)', async () => {
      const queryData = {
        query: `
        mutation updateWorkspace {
          updateWorkspace(data: { isMicrosoftAuthEnabled: false }) {
            id
            isMicrosoftAuthEnabled
          }
        }
      `,
      };

      return client
        .post('/graphql')
        .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
        .send(queryData)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toBe(
            PermissionsExceptionMessage.PERMISSION_DENIED,
          );
        });
    });
  });
  describe('workspace permissions', () => {
    it('should update workspace when permissions are enabled and user has permission', async () => {
      const queryData = {
        query: `
        mutation updateWorkspace {
          updateWorkspace(data: { displayName: "New Workspace Name" }) {
            id
            displayName
          }
        }
      `,
      };

      return client
        .post('/graphql')
        .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
        .send(queryData)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.errors).toBeUndefined();
        })
        .expect((res) => {
          const data = res.body.data.updateWorkspace;

          expect(data).toBeDefined();
          expect(data.displayName).toBe('New Workspace Name');
        });
    });
  });
});
