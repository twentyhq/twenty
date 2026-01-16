import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { type DeleteFrontComponentFactoryInput } from 'test/integration/metadata/suites/front-component/utils/delete-front-component-query-factory.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';
import { updateFrontComponent } from 'test/integration/metadata/suites/front-component/utils/update-front-component.util';

import { type UpdateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/update-front-component.input';

describe('Front component update should succeed', () => {
  let testFrontComponentId: string | undefined;

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
      input: { id: testFrontComponentId } as DeleteFrontComponentFactoryInput,
    });
    testFrontComponentId = undefined;
  });

  it('should update front component name', async () => {
    const { data } = await updateFrontComponent({
      expectToFail: false,
      input: {
        id: testFrontComponentId,
        update: {
          name: 'updatedFrontComponentName',
        },
      } as UpdateFrontComponentInput,
    });

    expect(data.updateFrontComponent).toMatchObject({
      id: testFrontComponentId,
      name: 'updatedFrontComponentName',
    });
  });
});
