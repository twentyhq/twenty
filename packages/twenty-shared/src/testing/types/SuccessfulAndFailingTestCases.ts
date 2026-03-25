import { type EachTestingContext } from '@/testing/types/EachTestingContext.type';

export type SuccessfulAndFailingTestCases<T> = {
  successful: EachTestingContext<T>[];
  failing: EachTestingContext<T>[];
};
