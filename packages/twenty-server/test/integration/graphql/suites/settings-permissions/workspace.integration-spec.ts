import gql from 'graphql-tag';
import request from 'supertest';
import { makeMetadataAPIRequestWithFileUpload } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-file-upload.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const uploadWorkspaceLogoMutation = gql`
  mutation UploadWorkspaceLogo($file: Upload!) {
    uploadWorkspaceLogo(file: $file) {
      id
      url
    }
  }
`;

const client = request(`http://localhost:${APP_PORT}`);

describe('workspace permissions', () => {
  let originalWorkspaceState: Record<string, unknown>;

  beforeAll(async () => {
    // Store original workspace state
    const query = gql`
      query getWorkspace {
        currentWorkspace {
          displayName
          isGoogleAuthEnabled
          isMicrosoftAuthEnabled
          isPasswordAuthEnabled
          logo
          isPublicInviteLinkEnabled
          subdomain
        }
      }
    `;

    const response = await makeMetadataAPIRequest({ query });

    originalWorkspaceState = response.body.data.currentWorkspace;
  });

  afterAll(async () => {
    // Restore workspace state
    const restoreQuery = gql`
      mutation updateWorkspace {
        updateWorkspace(data: {
          displayName: "${originalWorkspaceState.displayName}",
          subdomain: "${originalWorkspaceState.subdomain}",
          logo: "${originalWorkspaceState.logo}",
          isGoogleAuthEnabled: ${originalWorkspaceState.isGoogleAuthEnabled},
          isMicrosoftAuthEnabled: ${originalWorkspaceState.isMicrosoftAuthEnabled},
          isPasswordAuthEnabled: ${originalWorkspaceState.isPasswordAuthEnabled}
          isPublicInviteLinkEnabled: ${originalWorkspaceState.isPublicInviteLinkEnabled}
        }) {
          id
        }
      }
    `;

    await makeMetadataAPIRequest({ query: restoreQuery });
  });

  describe('workspace permissions', () => {
    describe('delete workspace', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        const queryData = {
          query: `
              mutation DeleteCurrentWorkspace {
        deleteCurrentWorkspace {
          id
          __typename
        }
      }
      `,
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
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
    describe('display name update', () => {
      it('should update workspace display name when user has workspace settings permission', async () => {
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
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
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

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const queryData = {
          query: `
        mutation updateWorkspace {
          updateWorkspace(data: { displayName: "Another New Workspace Name" }) {
            id
            displayName
          }
        }
      `,
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
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

    describe('subdomain update', () => {
      it('should update workspace subdomain when user has workspace settings permission', async () => {
        const queryData = {
          query: `
        mutation updateWorkspace {
          updateWorkspace(data: { subdomain: "new-subdomain" }) {
            id
            subdomain
          }
        }
      `,
        };

        return client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(queryData)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.errors).toBeUndefined();
          })
          .expect((res) => {
            const data = res.body.data.updateWorkspace;

            expect(data).toBeDefined();
            expect(data.subdomain).toBe('new-subdomain');
          });
      });

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const queryData = {
          query: `
        mutation updateWorkspace {
          updateWorkspace(data: { subdomain: "another-new-subdomain" }) {
            id
            subdomain
          }
        }
      `,
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
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

    describe('custom domain update', () => {
      it('should update workspace custom domain when user has workspace settings permission', async () => {
        const queryData = {
          query: `
        mutation updateWorkspace {
          updateWorkspace(data: { customDomain: null }) {
            id
            customDomain
          }
        }
      `,
        };

        return client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(queryData)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.errors).toBeUndefined();
          })
          .expect((res) => {
            const data = res.body.data.updateWorkspace;

            expect(data).toBeDefined();
            expect(data.customDomain).toBe(null);
          });
      });

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const queryData = {
          query: `
        mutation updateWorkspace {
          updateWorkspace(data: { customDomain: "another-new-custom-domain" }) {
            id
            customDomain
          }
        }
      `,
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
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

    describe('logo update', () => {
      beforeAll(() => {
        jest.useRealTimers();
      });

      afterAll(() => {
        jest.useFakeTimers();
      });

      it('should update workspace logo when user has workspace settings permission', async () => {
        const testImageBuffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64',
        );

        const uploadResponse = await makeMetadataAPIRequestWithFileUpload(
          {
            query: uploadWorkspaceLogoMutation,
            variables: { file: null },
          },
          {
            field: 'file',
            buffer: testImageBuffer,
            filename: 'test-logo.png',
            contentType: 'image/png',
          },
          APPLE_JANE_ADMIN_ACCESS_TOKEN,
        );

        expect(uploadResponse.status).toBe(200);
        expect(uploadResponse.body.errors).toBeUndefined();
        expect(uploadResponse.body.data).toBeDefined();
        expect(uploadResponse.body.data.uploadWorkspaceLogo).toBeDefined();
        expect(uploadResponse.body.data.uploadWorkspaceLogo.id).toBeDefined();
        expect(uploadResponse.body.data.uploadWorkspaceLogo.url).toBeDefined();

        const getWorkspaceQuery = gql`
          query GetWorkspace {
            currentWorkspace {
              logo
            }
          }
        `;

        const workspaceResponse = await makeMetadataAPIRequest({
          query: getWorkspaceQuery,
        });

        expect(workspaceResponse.body.data.currentWorkspace.logo).toBeDefined();
      });

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const testImageBuffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64',
        );

        const response = await makeMetadataAPIRequestWithFileUpload(
          {
            query: uploadWorkspaceLogoMutation,
            variables: { file: null },
          },
          {
            field: 'file',
            buffer: testImageBuffer,
            filename: 'test-logo.png',
            contentType: 'image/png',
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );

        expect(response.status).toBe(200);
        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.FORBIDDEN,
        );
      });
    });
  });

  describe('billing', () => {
    describe('switchSubscriptionInterval', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        const queryData = {
          query: `
            mutation SwitchSubscriptionInterval {
              switchSubscriptionInterval {
                billingSubscriptions {
                  id
                }
                currentBillingSubscription {
                  id
                }
              }
            }
          `,
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
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

    describe('billingPortalSession', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        const queryData = {
          query: `
            query BillingPortalSession($returnUrlPath: String!) {
              billingPortalSession(returnUrlPath: $returnUrlPath) {
                url
              }
            }
          `,
          variables: {
            returnUrlPath: '/settings/billing',
          },
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
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

    describe('checkoutSession', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        const queryData = {
          query: `
            mutation CheckoutSession(
              $recurringInterval: SubscriptionInterval!
              $successUrlPath: String!
              $plan: BillingPlanKey!
              $requirePaymentMethod: Boolean
            ) {
              checkoutSession(
                recurringInterval: $recurringInterval
                successUrlPath: $successUrlPath
                plan: $plan
                requirePaymentMethod: $requirePaymentMethod
              ) {
                url
              }
            }
          `,
          variables: {
            recurringInterval: 'Month',
            successUrlPath: '/settings/billing',
            plan: BillingPlanKey.PRO,
            requirePaymentMethod: true,
          },
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
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

  describe('lab', () => {
    describe('updateLabPublicFeatureFlag', () => {
      it('should update feature flag when user has workspace settings permission', async () => {
        const queryData = {
          query: `
                mutation UpdateLabPublicFeatureFlag(
                  $input: UpdateLabPublicFeatureFlagInput!
                ) {
                  updateLabPublicFeatureFlag(input: $input) {
                    key
                    value
                  }
                }
              `,
          variables: {
            input: {
              publicFeatureFlag: FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED,
              value: true,
            },
          },
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(queryData)
          .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors[0].message).toBe(
              'Invalid feature flag key, flag is not public',
            );
          });
      });

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const queryData = {
          query: `
              mutation UpdateLabPublicFeatureFlag(
                $input: UpdateLabPublicFeatureFlagInput!
              ) {
                updateLabPublicFeatureFlag(input: $input) {
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
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
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
