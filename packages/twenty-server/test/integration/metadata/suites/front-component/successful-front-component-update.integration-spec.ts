import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';
import { seedBuiltFrontComponentFile } from 'test/integration/metadata/suites/front-component/utils/seed-built-front-component-file.util';
import { updateFrontComponent } from 'test/integration/metadata/suites/front-component/utils/update-front-component.util';
import { isDefined } from 'twenty-shared/utils';

describe('Front component update should succeed', () => {
  let testFrontComponentId: string | undefined;
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

  beforeEach(async () => {
    const { data } = await createFrontComponent({
      expectToFail: false,
      input: {
        name: 'testFrontComponentToUpdate',
        componentName: 'TestFrontComponentToUpdate',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: 'src/front-components/index.mjs',
        builtComponentChecksum: 'abc123',
      },
    });

    testFrontComponentId = data.createFrontComponent.id;
  });

  afterEach(async () => {
    if (isDefined(testFrontComponentId)) {
      await deleteFrontComponent({
        expectToFail: false,
        input: { id: testFrontComponentId },
      });
      testFrontComponentId = undefined;
    }
  });

  it('should update front component name', async () => {
    if (!isDefined(testFrontComponentId)) {
      throw new Error('testFrontComponentId should be defined');
    }

    const { data } = await updateFrontComponent({
      expectToFail: false,
      input: {
        id: testFrontComponentId,
        update: {
          name: 'updatedFrontComponentName',
        },
      },
    });

    expect(data.updateFrontComponent).toMatchObject({
      id: testFrontComponentId,
      name: 'updatedFrontComponentName',
    });
  });
});
