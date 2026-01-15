import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';
import { v4 } from 'uuid';

describe('Front component deletion should fail', () => {
  it('should fail when deleting a non-existent front component', async () => {
    const nonExistentId = v4();

    const { errors } = await deleteFrontComponent({
      expectToFail: true,
      input: { id: nonExistentId },
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
  });
});
