import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

export const waitForAllJobsAfter =
  <TArgs extends unknown[], TResult>(
    operation: (...args: TArgs) => Promise<TResult>,
  ) =>
  async (...args: TArgs): Promise<TResult> => {
    const result = await operation(...args);

    await waitForAllJobsToFinish();

    return result;
  };
