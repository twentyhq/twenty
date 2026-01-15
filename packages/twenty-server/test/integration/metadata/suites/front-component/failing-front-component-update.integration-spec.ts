import { updateFrontComponent } from 'test/integration/metadata/suites/front-component/utils/update-front-component.util';
import { v4 } from 'uuid';

describe('Front component update should fail', () => {
  it('should fail when updating a non-existent front component', async () => {
    const nonExistentId = v4();

    const { errors } = await updateFrontComponent({
      expectToFail: true,
      input: {
        id: nonExistentId,
        name: 'updatedName',
      },
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
  });
});
