import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';
import { updateFrontComponent } from 'test/integration/metadata/suites/front-component/utils/update-front-component.util';

describe('Front component update should succeed', () => {
  let testFrontComponentId: string;

  beforeEach(async () => {
    const { data } = await createFrontComponent({
      expectToFail: false,
      input: {
        name: 'testFrontComponentToUpdate',
      },
    });

    testFrontComponentId = data.createFrontComponent.id;
  });

  afterEach(async () => {
    await deleteFrontComponent({
      expectToFail: false,
      input: { id: testFrontComponentId },
    });
  });

  it('should update front component name', async () => {
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
