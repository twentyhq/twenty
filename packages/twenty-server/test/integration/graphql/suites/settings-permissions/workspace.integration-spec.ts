import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

import gql from 'graphql-tag';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

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

    const response = await makeGraphqlAPIRequest<any>({
      operation: { query },
    });

    originalWorkspaceState = response.data.currentWorkspace;
  });

  afterAll(async () => {
    const disablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IS_PERMISSIONS_ENABLED',
      false,
    );

    await makeGraphqlAPIRequest({
      operation: disablePermissionsQuery,
    });

    // Restore workspace state
    const query = gql`
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

    await makeGraphqlAPIRequest({
      operation: { query },
    });
  });

  describe('workspace permissions', () => {
    describe('delete workspace', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        const query = gql`
          mutation DeleteCurrentWorkspace {
            deleteCurrentWorkspace {
              id
              __typename
            }
          }
        `;

        const response = await makeGraphqlAPIRequest({
          operation: { query },
          options: {
            testingToken: 'MEMBER',
          },
        });

        expect(response.data).toBeNull();
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
    });

    describe('display name update', () => {
      it('should update workspace display name when user has workspace settings permission', async () => {
        const query = gql`
          mutation updateWorkspace {
            updateWorkspace(data: { displayName: "New Workspace Name" }) {
              id
              displayName
            }
          }
        `;

        const response = await makeGraphqlAPIRequest<any>({
          operation: { query },
        });

        expect(response.data).toBeDefined();
        expect(response.errors).toBeUndefined();
        const data = response.data.updateWorkspace;
        expect(data).toBeDefined();
        expect(data.displayName).toBe('New Workspace Name');
      });

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const query = gql`
          mutation updateWorkspace {
            updateWorkspace(data: { displayName: "Another New Workspace Name" }) {
              id
              displayName
            }
          }
        `;

        const response = await makeGraphqlAPIRequest({
          operation: { query },
          options: {
            testingToken: 'MEMBER',
          },
        });

        expect(response.data).toBeNull();
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
    });

    describe('subdomain update', () => {
      it('should update workspace subdomain when user has workspace settings permission', async () => {
        const query = gql`
          mutation updateWorkspace {
            updateWorkspace(data: { subdomain: "new-subdomain" }) {
              id
              subdomain
            }
          }
        `;

        const response = await makeGraphqlAPIRequest<any>({
          operation: { query },
        });

        expect(response.data).toBeDefined();
        expect(response.errors).toBeUndefined();
        const data = response.data.updateWorkspace;
        expect(data).toBeDefined();
        expect(data.subdomain).toBe('new-subdomain');
      });

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const query = gql`
          mutation updateWorkspace {
            updateWorkspace(data: { subdomain: "another-new-subdomain" }) {
              id
              subdomain
            }
          }
        `;

        const response = await makeGraphqlAPIRequest({
          operation: { query },
          options: {
            testingToken: 'MEMBER',
          },
        });

        expect(response.data).toBeNull();
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
    });

    describe('custom domain update', () => {
      it('should update workspace custom domain when user has workspace settings permission', async () => {
        const query = gql`
          mutation updateWorkspace {
            updateWorkspace(data: { customDomain: null }) {
              id
              customDomain
            }
          }
        `;

        const response = await makeGraphqlAPIRequest<any>({
          operation: { query },
        });

        expect(response.data).toBeDefined();
        expect(response.errors).toBeUndefined();
        const data = response.data.updateWorkspace;
        expect(data).toBeDefined();
        expect(data.customDomain).toBe(null);
      });

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const query = gql`
          mutation updateWorkspace {
            updateWorkspace(data: { customDomain: "another-new-custom-domain" }) {
              id
              customDomain
            }
          }
        `;

        const response = await makeGraphqlAPIRequest({
          operation: { query },
          options: {
            testingToken: 'MEMBER',
          },
        });

        expect(response.data).toBeNull();
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
    });

    describe('logo update', () => {
      it('should update workspace logo when user has workspace settings permission', async () => {
        const query = gql`
          mutation updateWorkspace {
            updateWorkspace(data: { logo: "new-logo" }) {
              id
              logo
            }
          }
        `;

        const response = await makeGraphqlAPIRequest<any>({
          operation: { query },
        });

        expect(response.data).toBeDefined();
        expect(response.errors).toBeUndefined();
        const data = response.data.updateWorkspace;
        expect(data).toBeDefined();
        expect(data.logo).toContain('new-logo');
      });

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const query = gql`
          mutation updateWorkspace {
            updateWorkspace(data: { logo: "another-new-logo" }) {
              id
              logo
            }
          }
        `;

        const response = await makeGraphqlAPIRequest({
          operation: { query },
          options: {
            testingToken: 'MEMBER',
          },
        });

        expect(response.data).toBeNull();
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
    });
  });

  describe('billing', () => {
    describe('switchToYearlyInterval', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        const query = gql`
          mutation SwitchToYearlyInterval {
            switchToYearlyInterval {
              success
            }
          }
        `;

        const response = await makeGraphqlAPIRequest({
          operation: { query },
          options: {
            testingToken: 'MEMBER',
          },
        });

        expect(response.data).toBeNull();
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
    });

    describe('billingPortalSession', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        const query = gql`
          query BillingPortalSession($returnUrlPath: String!) {
            billingPortalSession(returnUrlPath: $returnUrlPath) {
              url
            }
          }
        `;

        const response = await makeGraphqlAPIRequest({
          operation: {
            query,
            variables: {
              returnUrlPath: '/settings/billing',
            },
          },
          options: {
            testingToken: 'MEMBER',
          },
        });

        expect(response.data).toBeNull();
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
    });

    describe('checkoutSession', () => {
      it('should throw a permission error when user does not have permission (member role)', async () => {
        const query = gql`
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
        `;

        const response = await makeGraphqlAPIRequest({
          operation: {
            query,
            variables: {
              recurringInterval: 'Month',
              successUrlPath: '/settings/billing',
              plan: BillingPlanKey.PRO,
              requirePaymentMethod: true,
            },
          },
          options: {
            testingToken: 'MEMBER',
          },
        });

        expect(response.data).toBeNull();
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
    });
  });

  describe('lab', () => {
    describe('updateLabPublicFeatureFlag', () => {
      it('should update feature flag when user has workspace settings permission', async () => {
        const query = gql`
          mutation UpdateLabPublicFeatureFlag(
            $input: UpdateLabPublicFeatureFlagInput!
          ) {
            updateLabPublicFeatureFlag(input: $input) {
              key
              value
            }
          }
        `;

        const response = await makeGraphqlAPIRequest<any>({
          operation: {
            query,
            variables: {
              input: {
                publicFeatureFlag: 'IS_STRIPE_INTEGRATION_ENABLED',
                value: true,
              },
            },
          },
        });

        expect(response.data).toBeDefined();
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          'Invalid feature flag key, flag is not public',
        );
      });

      it('should throw a permission error when user does not have permission (member role)', async () => {
        const query = gql`
          mutation UpdateLabPublicFeatureFlag(
            $input: UpdateLabPublicFeatureFlagInput!
          ) {
            updateLabPublicFeatureFlag(input: $input) {
              key
              value
            }
          }
        `;

        const response = await makeGraphqlAPIRequest<any>({
          operation: {
            query,
            variables: {
              input: {
                publicFeatureFlag: 'TestFeature',
                value: false,
              },
            },
          },
          options: {
            testingToken: 'MEMBER',
          },
        });

        expect(response.data).toBeNull();
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
    });
  });
});
