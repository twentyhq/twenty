import { validate } from 'class-validator';

import { NotIn } from 'src/engine/utils/custom-class-validator/NotIn';

describe('NotInConstraint', () => {
  test('should throw error when word is forbidden', async () => {
    class Test {
      @NotIn(['forbidden', 'restricted'])
      subdomain: string;
    }

    const instance = new Test();

    instance.subdomain = 'Forbidden';

    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toEqual({
      NotInConstraint: 'forbidden, restricted are not allowed',
    });
  });

  test('should throw error when regex is forbidden', async () => {
    class Test {
      @NotIn(['forbidden', 'restricted', /api-(.*?)+/])
      subdomain: string;
    }

    const instance = new Test();

    instance.subdomain = 'api-unauthorized';

    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toEqual({
      NotInConstraint: 'forbidden, restricted, /api-(.*?)+/ are not allowed',
    });
  });

  test('should pass validation word is not in the list', async () => {
    class Test {
      @NotIn(['forbidden', 'restricted'])
      subdomain: string;
    }

    const instance = new Test();

    instance.subdomain = 'valid';

    const errors = await validate(instance);

    expect(errors.length).toEqual(0);
  });
});
