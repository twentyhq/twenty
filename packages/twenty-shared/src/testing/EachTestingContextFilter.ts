import { type EachTestingContext } from '@/testing/types/EachTestingContext.type';

export const eachTestingContextFilter = <T>(
  testCases: EachTestingContext<T>[],
) => {
  const onlyTestsCases = testCases.filter((testCase) => testCase.only === true);

  if (process.env.CI && onlyTestsCases.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      'Should never push tests cases with an only to true, only to use in dev env\n returning the whole test suite anyway',
    );
    return testCases;
  }

  if (onlyTestsCases.length > 0) {
    return onlyTestsCases;
  }

  return testCases;
};
