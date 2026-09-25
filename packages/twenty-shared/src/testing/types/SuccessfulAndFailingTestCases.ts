import { type EachTestingContext } from '@/testing/types/EachTestingContext';

export type SuccessfulAndFailingTestCases<T> = {
  successful: EachTestingContext<T>[];
  failing: EachTestingContext<T>[];
};
