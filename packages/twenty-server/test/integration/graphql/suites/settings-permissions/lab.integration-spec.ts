import request from 'supertest';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

describe('LabResolver', () => {
  beforeAll(async () => {
    const enablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      true,
    );

    await makeGraphqlAPIRequest(enablePermissionsQuery);
  });

  afterAll(async () => {
    const disablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      false,
    );

    await makeGraphqlAPIRequest(disablePermissionsQuery);
  });

  describe('lab permissions', () => {
    describe('updateLabPublicFeatureFlag', () => {
      it('should update feature flag when user has lab settings permission', async () => {
        const queryData = {
          query: `
              mutation UpdateLabPublicFeatureFlag(
                $input: UpdateLabPublicFeatureFlagInput!
              ) {
                updateLabPublicFeatureFlag(input: $input) {
                  id
                  key
                  value
                }
              }
            `,
          variables: {
            input: {
              publicFeatureFlag: 'TestFeature',
              value: true,
            },
          },
        };

        await client
          .post('/graphql')
          .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
          .send(queryData)
          .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors[0].message).toBe('Invalid feature flag key'); // this error shows that update has been attempted after the permission check
          });
      });

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const queryData = {
          query: `
            mutation UpdateLabPublicFeatureFlag(
              $input: UpdateLabPublicFeatureFlagInput!
            ) {
              updateLabPublicFeatureFlag(input: $input) {
                id
                key
                value
              }
            }
          `,
          variables: {
            input: {
              publicFeatureFlag: 'TestFeature',
              value: false,
            },
          },
        };

        await client
          .post('/graphql')
          .set('Authorization', `Bearer ${MEMBER_ACCESS_TOKEN}`)
          .send(queryData)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeNull();
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors[0].message).toBe(
              PermissionsExceptionMessage.PERMISSION_DENIED,
            );
            expect(res.body.errors[0].extensions.code).toBe(
              ErrorCode.FORBIDDEN,
            );
          });
      });
    });
  });
});
