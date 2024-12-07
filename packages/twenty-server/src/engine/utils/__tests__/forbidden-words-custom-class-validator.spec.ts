import { validate } from 'class-validator';

import { ForbiddenWords } from 'src/engine/utils/custom-class-validator/ForbiddenWords';

describe('ForbiddenWordsConstraint', () => {
  test('should throw error when word is forbidden', async () => {
    class Test {
      @ForbiddenWords(['forbidden', 'restricted'])
      subdomain: string;
    }

    const instance = new Test();

    instance.subdomain = 'forbidden';

    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toEqual({
      ForbiddenWordsConstraint: 'forbidden, restricted are not allowed',
    });
  });

  test('should pass validation word is not in the list', async () => {
    class Test {
      @ForbiddenWords(['forbidden', 'restricted'])
      subdomain: string;
    }

    const instance = new Test();

    instance.subdomain = 'valid';

    const errors = await validate(instance);

    expect(errors.length).toEqual(0);
  });
});
