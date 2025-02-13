import request from 'supertest';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';

const client = request(`http://localhost:${APP_PORT}`);

describe('WorkspaceResolver', () => {
  beforeEach(async () => {
    const query = updateFeatureFlagFactory(
      'a43da6fa-8792-492f-8113-7a911b05bc14',
      'IsPermissionsEnabled',
      true,
    );

    await client.post('/graphql').send(query);
  });
  afterEach(async () => {
    const query = updateFeatureFlagFactory(
      'a43da6fa-8792-492f-8113-7a911b05bc14',
      'IsPermissionsEnabled',
      false,
    );

    await client.post('/graphql').send(query);
  });
  describe('security permissions', () => {
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
