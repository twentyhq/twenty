import { Response } from 'supertest';

export type GraphQLError = {
  message: string;
  path?: string[];
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
};

export type CommonResponseBody<TData = unknown> = {
  data: TData | null;
  errors?: GraphQLError[];
  rawResponse: Response;
}; 