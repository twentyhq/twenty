import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';

describe('Front component creation should succeed', () => {
  let createdFrontComponentId: string | undefined;

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
      },
    });

    createdFrontComponentId = data?.createFrontComponent?.id;

    expect(data.createFrontComponent).toMatchObject({
      id: expect.any(String),
      name: 'frontComponentWithSpaces',
    });
  });
});
