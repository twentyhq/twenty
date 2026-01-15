import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';

describe('Front component creation should fail', () => {
  it('should fail when creating a front component with empty name', async () => {
    const { errors } = await createFrontComponent({
      expectToFail: true,
      input: {
        name: '',
      },
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
  });

  it('should fail when creating a front component with whitespace-only name', async () => {
    const { errors } = await createFrontComponent({
      expectToFail: true,
      input: {
        name: '   ',
      },
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
  });
});
