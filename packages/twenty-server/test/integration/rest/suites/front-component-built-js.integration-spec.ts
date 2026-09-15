import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';
import { seedBuiltFrontComponentFile } from 'test/integration/metadata/suites/front-component/utils/seed-built-front-component-file.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';

const BUILT_COMPONENT_PATH = 'src/front-components/test-endpoint.mjs';

describe('Front component built JS endpoint', () => {
  let frontComponentId: string;
  let cleanupBuiltFile: (() => void) | undefined;

  beforeAll(async () => {
    const { cleanup } = await seedBuiltFrontComponentFile({
      builtComponentPath: BUILT_COMPONENT_PATH,
    });

    cleanupBuiltFile = cleanup;

    const { data } = await createFrontComponent({
      expectToFail: false,
      input: {
        name: 'testBuiltJsEndpoint',
        componentName: 'TestBuiltJsEndpoint',
        sourceComponentPath: 'src/front-components/test-endpoint.tsx',
        builtComponentPath: BUILT_COMPONENT_PATH,
        builtComponentChecksum: 'test-checksum-123',
      },
    });

    frontComponentId = data.createFrontComponent.id;
  });

  afterAll(async () => {
    if (frontComponentId) {
      await deleteFrontComponent({
        expectToFail: false,
        input: { id: frontComponentId },
      });
    }

    cleanupBuiltFile?.();
  });

  it('should serve the built JS file with correct content type', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/front-components/${frontComponentId}`,
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    })
      .expect(200)
      .expect('Content-Type', /application\/javascript/)
      .expect((res) => {
        expect(res.text).toBe('dummy built component content');
      });
  });

  it('should serve the built JS from the checksum-fingerprinted path with an immutable cache header', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/front-components/${frontComponentId}/test-checksum-123.js`,
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    })
      .expect(200)
      .expect('Content-Type', /application\/javascript/)
      .expect('Cache-Control', 'private, max-age=86400, immutable')
      .expect((res) => {
        expect(res.text).toBe('dummy built component content');
      });
  });

  it('should return 404 for a non-existent front component ID', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/front-components/${nonExistentId}`,
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expectOneNotInternalServerErrorHttpResponseSnapshot(response);
  });

  it('should return 404 when front component exists but built file is missing on storage', async () => {
    const missingBuiltPath = 'src/front-components/will-be-deleted.mjs';

    const { cleanup } = await seedBuiltFrontComponentFile({
      builtComponentPath: missingBuiltPath,
    });

    const { data } = await createFrontComponent({
      expectToFail: false,
      input: {
        name: 'testMissingBuiltFile',
        componentName: 'TestMissingBuiltFile',
        sourceComponentPath: 'src/front-components/will-be-deleted.tsx',
        builtComponentPath: missingBuiltPath,
        builtComponentChecksum: 'will-be-deleted-checksum',
      },
    });

    const missingFileComponentId = data.createFrontComponent.id;

    cleanup();

    try {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/front-components/${missingFileComponentId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expectOneNotInternalServerErrorHttpResponseSnapshot(response);
    } finally {
      await deleteFrontComponent({
        expectToFail: false,
        input: { id: missingFileComponentId },
      });
    }
  });

  it('should return 403 when no token is provided', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/front-components/${frontComponentId}`,
      bearer: '',
    }).expect(403);
  });

  it('should return 401 when an invalid token is provided', async () => {
    await makeRestAPIRequest({
      method: 'get',
      path: `/front-components/${frontComponentId}`,
      bearer: INVALID_ACCESS_TOKEN,
    }).expect(401);
  });
});
