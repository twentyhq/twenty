import { seedBuiltSharedDependenciesFile } from 'test/integration/metadata/suites/application/utils/seed-built-shared-dependencies-file.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SHARED_DEPENDENCIES_BUILT_PATH =
  'src/front-component-shared-dependencies.mjs';
const SHARED_DEPENDENCIES_CHECKSUM = 'a'.repeat(64);
const MISMATCHED_CHECKSUM = 'b'.repeat(64);
const SHARED_DEPENDENCIES_BUNDLE_CONTENT =
  'export const sharedDependenciesReady = true;\n';

describe('Front component shared dependencies endpoint', () => {
  let applicationId: string;
  let applicationUniversalIdentifier: string;
  let cleanupSharedDependenciesFile: (() => void) | undefined;

  beforeAll(async () => {
    const [workspace] = await global.testDataSource.query(
      'SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

    applicationUniversalIdentifier = workspace.workspaceCustomApplicationId;

    const [application] = await global.testDataSource.query(
      'SELECT id FROM core."application" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2',
      [applicationUniversalIdentifier, SEED_APPLE_WORKSPACE_ID],
    );

    applicationId = application.id;
  });

  afterAll(async () => {
    await global.testDataSource.query(
      'UPDATE core."application" SET "frontComponentSharedDependenciesBuiltPath" = NULL, "frontComponentSharedDependenciesChecksum" = NULL WHERE id = $1',
      [applicationId],
    );

    cleanupSharedDependenciesFile?.();
  });

  it('should return 404 when the application declares no shared dependencies bundle', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/front-component-shared-dependencies/${applicationId}`,
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    }).expect(404);
  });

  it('should return 404 for a non-existent application', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: '/front-component-shared-dependencies/00000000-0000-0000-0000-000000000000',
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    }).expect(404);
  });

  describe('with a built shared dependencies bundle', () => {
    beforeAll(async () => {
      const { cleanup } = seedBuiltSharedDependenciesFile({
        applicationUniversalIdentifier,
        builtPath: SHARED_DEPENDENCIES_BUILT_PATH,
        content: SHARED_DEPENDENCIES_BUNDLE_CONTENT,
      });

      cleanupSharedDependenciesFile = cleanup;

      await global.testDataSource.query(
        'UPDATE core."application" SET "frontComponentSharedDependenciesBuiltPath" = $1, "frontComponentSharedDependenciesChecksum" = $2 WHERE id = $3',
        [
          SHARED_DEPENDENCIES_BUILT_PATH,
          SHARED_DEPENDENCIES_CHECKSUM,
          applicationId,
        ],
      );
    });

    it('should serve the shared dependencies bundle with no-store on the plain path', async () => {
      await makeRestAPIRequest({
        method: 'get',
        path: `/front-component-shared-dependencies/${applicationId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      })
        .expect(200)
        .expect('Content-Type', /application\/javascript/)
        .expect('X-Content-Type-Options', 'nosniff')
        .expect('Content-Disposition', 'attachment')
        .expect('Cache-Control', 'private, no-store')
        .expect((res) => {
          expect(res.text).toBe(SHARED_DEPENDENCIES_BUNDLE_CONTENT);
        });
    });

    it('should serve the checksum-fingerprinted path with an immutable cache header', async () => {
      await makeRestAPIRequest({
        method: 'get',
        path: `/front-component-shared-dependencies/${applicationId}/${SHARED_DEPENDENCIES_CHECKSUM}.js`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      })
        .expect(200)
        .expect('Cache-Control', 'private, max-age=86400, immutable')
        .expect((res) => {
          expect(res.text).toBe(SHARED_DEPENDENCIES_BUNDLE_CONTENT);
        });
    });

    it('should serve no-store when the requested checksum does not match', async () => {
      await makeRestAPIRequest({
        method: 'get',
        path: `/front-component-shared-dependencies/${applicationId}/${MISMATCHED_CHECKSUM}.js`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      })
        .expect(200)
        .expect('Cache-Control', 'private, no-store');
    });

    it('should fail closed on a malformed cache key', async () => {
      await makeRestAPIRequest({
        method: 'get',
        path: `/front-component-shared-dependencies/${applicationId}/not-a-checksum.js`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      })
        .expect(200)
        .expect('Cache-Control', 'private, no-store');
    });
  });
});
