import { MakeMetadataAPIRequestOptions } from "test/integration/graphql/utils/make-graphql-request.util";

export type CommonOperationInput<T> = {
  input: T;
  options?: MakeMetadataAPIRequestOptions
}