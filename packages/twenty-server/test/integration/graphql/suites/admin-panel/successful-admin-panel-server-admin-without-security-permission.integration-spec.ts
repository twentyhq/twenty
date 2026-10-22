import { gql } from 'graphql-tag';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

/* global APPLE_PHIL_GUEST_ACCESS_TOKEN */

// Phil is a full server admin whose guest role lacks the SECURITY permission.
describe('Admin panel access for a server admin without the SECURITY permission', () => {
  it('should load server admins', async () => {
    const response = await makeAdminPanelApiRequest(
      {
        query: gql`
          query GetServerAdmins {
            getServerAdmins {
              id
            }
          }
        `,
      },
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getServerAdmins.length).toBeGreaterThan(0);
  });

  it('should load AI providers', async () => {
    const response = await makeAdminPanelApiRequest(
      {
        query: gql`
          query GetAiProviders {
            getAiProviders
          }
        `,
      },
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getAiProviders).toBeDefined();
  });

  it('should load workspace usage limits', async () => {
    const response = await makeAdminPanelApiRequest(
      {
        query: gql`
          query WorkspaceUsageLimits($workspaceId: UUID!) {
            workspaceUsageLimits(workspaceId: $workspaceId) {
              defaults {
                limitValue
              }
            }
          }
        `,
        variables: { workspaceId: SEED_APPLE_WORKSPACE_ID },
      },
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.workspaceUsageLimits.defaults).toBeDefined();
  });
});
