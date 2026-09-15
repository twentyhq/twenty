import gql from 'graphql-tag';
import { seedWorkspaceLogo } from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

describe('Workspace logo removal should succeed', () => {
  let workspaceId: string;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    jest.useRealTimers();

    const seeded = await seedWorkspaceLogo();

    workspaceId = seeded.workspaceId;
    cleanup = seeded.cleanup;

    jest.useFakeTimers();
  }, 60000);

  afterAll(async () => {
    await cleanup();
  });

  it('should clear logoFileId so the resolver stops signing a deleted file', async () => {
    jest.useRealTimers();

    const response = await makeMetadataAPIRequest({
      query: gql`
        mutation UpdateWorkspace {
          updateWorkspace(data: { logo: null }) {
            id
            logo
          }
        }
      `,
    });

    jest.useFakeTimers();

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWorkspace.logo).toBe('');

    const [workspace] = await globalThis.testDataSource.query(
      `SELECT "logoFileId" FROM core."workspace" WHERE id = $1`,
      [workspaceId],
    );

    expect(workspace.logoFileId).toBeNull();
  }, 30000);
});
