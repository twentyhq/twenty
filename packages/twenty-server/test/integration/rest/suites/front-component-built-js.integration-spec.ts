import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';
import { seedBuiltFrontComponentFile } from 'test/integration/metadata/suites/front-component/utils/seed-built-front-component-file.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

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

  it('should return 404 for a non-existent front component ID', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    await makeRestAPIRequest({
      method: 'get',
      path: `/front-components/${nonExistentId}`,
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    })
      .expect(404)
      .expect((res) => {
        expect(res.body.statusCode).toBe(404);
      });
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
