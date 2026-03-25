import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export type CommonResponseBody<T> = Promise<{
  data: T;
  errors: BaseGraphQLError[];
}>;
