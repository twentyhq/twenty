import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';
import { seedBuiltFrontComponentFile } from 'test/integration/metadata/suites/front-component/utils/seed-built-front-component-file.util';

describe('Front component creation should succeed', () => {
  let createdFrontComponentId: string | undefined;
  let cleanupBuiltFile: (() => void) | undefined;

  beforeAll(async () => {
    const { cleanup } = await seedBuiltFrontComponentFile({
      builtComponentPath: 'src/front-components/index.mjs',
    });

    cleanupBuiltFile = cleanup;
  });

  afterAll(() => {
    cleanupBuiltFile?.();
  });

  afterEach(async () => {
    if (createdFrontComponentId) {
      await deleteFrontComponent({
        expectToFail: false,
        input: { id: createdFrontComponentId },
      });
      createdFrontComponentId = undefined;
    }
  });

  it('should create a basic front component with minimal input', async () => {
    const { data } = await createFrontComponent({
      expectToFail: false,
      input: {
        name: 'testFrontComponent',
        componentName: 'TestFrontComponent',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: 'src/front-components/index.mjs',
        builtComponentChecksum: 'abc123',
      },
    });

    createdFrontComponentId = data?.createFrontComponent?.id;

    expect(data.createFrontComponent).toMatchObject({
      id: expect.any(String),
      name: 'testFrontComponent',
    });
  });

  it('should sanitize input by trimming whitespace', async () => {
    const { data } = await createFrontComponent({
      expectToFail: false,
      input: {
        name: '  frontComponentWithSpaces  ',
        componentName: 'FrontComponentWithSpaces',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: 'src/front-components/index.mjs',
        builtComponentChecksum: 'abc123',
      },
    });

    createdFrontComponentId = data?.createFrontComponent?.id;

    expect(data.createFrontComponent).toMatchObject({
      id: expect.any(String),
      name: 'frontComponentWithSpaces',
    });
  });
});
