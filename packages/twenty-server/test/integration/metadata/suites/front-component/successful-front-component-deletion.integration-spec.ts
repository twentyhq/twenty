import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';
import { findFrontComponent } from 'test/integration/metadata/suites/front-component/utils/find-front-component.util';
import { seedBuiltFrontComponentFile } from 'test/integration/metadata/suites/front-component/utils/seed-built-front-component-file.util';

describe('Front component deletion should succeed', () => {
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

  it('should successfully delete a front component', async () => {
    const { data: createData } = await createFrontComponent({
      expectToFail: false,
      input: {
        name: 'frontComponentToDelete',
        componentName: 'FrontComponentToDelete',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: 'src/front-components/index.mjs',
        builtComponentChecksum: 'abc123',
      },
    });

    const frontComponentId = createData.createFrontComponent.id;

    const { data: findBeforeData } = await findFrontComponent({
      expectToFail: false,
      input: { id: frontComponentId },
    });

    expect(findBeforeData.frontComponent.id).toBe(frontComponentId);

    const { data: deleteData } = await deleteFrontComponent({
      expectToFail: false,
      input: { id: frontComponentId },
    });

    expect(deleteData.deleteFrontComponent).toMatchObject({
      id: frontComponentId,
      name: 'frontComponentToDelete',
    });

    const { data: findAfterData } = await findFrontComponent({
      expectToFail: false,
      input: { id: frontComponentId },
    });

    expect(findAfterData.frontComponent).toBeNull();
  });
});
