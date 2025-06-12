import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { Response } from 'supertest';

export type CommonResponseBody<T> = Promise<{
  data: T;
  errors: BaseGraphQLError[];
  rawResponse: Response;
}>;
