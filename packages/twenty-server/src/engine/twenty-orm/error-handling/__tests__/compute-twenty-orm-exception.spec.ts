import { QueryRunnerAlreadyReleasedError } from 'typeorm';

import { computeTwentyORMException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

describe('computeTwentyORMException', () => {
  it('should map a released query runner error to a retryable QUERY_RUNNER_RELEASED exception', async () => {
    const error = new QueryRunnerAlreadyReleasedError();

    const result = await computeTwentyORMException(error);

    expect(result).toBeInstanceOf(TwentyORMException);
    expect((result as TwentyORMException).code).toBe(
      TwentyORMExceptionCode.QUERY_RUNNER_RELEASED,
    );
  });

  it('should return unrelated errors unchanged', async () => {
    const error = new Error('some other error');

    const result = await computeTwentyORMException(error);

    expect(result).toBe(error);
  });
});
