import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

describe('Front component creation should succeed', () => {
  let createdFrontComponentId: string | undefined;

  beforeAll(() => {
    const fileStorageService = global.app.get(FileStorageService);

    jest
      .spyOn(fileStorageService, 'checkFileExists_v2')
      .mockResolvedValue(true);
  });

  afterAll(() => {
    jest.restoreAllMocks();
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
