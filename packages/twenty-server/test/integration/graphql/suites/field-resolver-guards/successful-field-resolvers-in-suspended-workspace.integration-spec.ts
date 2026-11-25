import gql from 'graphql-tag';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { readFrontMetadataDocument } from 'test/integration/graphql/utils/read-front-metadata-document.util';
import { setWorkspaceActivationStatusAndInvalidateCache } from 'test/integration/graphql/utils/set-workspace-activation-status-and-invalidate-cache.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('Field resolvers in a suspended workspace', () => {
  beforeEach(async () => {
    await setWorkspaceActivationStatusAndInvalidateCache({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      activationStatus: WorkspaceActivationStatus.SUSPENDED,
    });
  });

  afterEach(async () => {
    await setWorkspaceActivationStatusAndInvalidateCache({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    });
  });

  it('should resolve every field of GetCurrentUser, a root allowed in a suspended workspace', async () => {
    const response = await makeMetadataApiRequest({
      query: readFrontMetadataDocument('GetCurrentUser'),
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.currentUser.currentWorkspace).toMatchObject({
      id: SEED_APPLE_WORKSPACE_ID,
      activationStatus: WorkspaceActivationStatus.SUSPENDED,
      featureFlags: expect.any(Array),
      workspaceUrls: expect.any(Object),
    });
  });

  it('should still refuse a root not allowed in a suspended workspace', async () => {
    const response = await makeMetadataApiRequest({
      query: gql`
        query CurrentWorkspace {
          currentWorkspace {
            id
          }
        }
      `,
    });

    expect(response.body.data).toBeNull();
    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });
});
