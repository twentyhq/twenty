import { MakeMetadataAPIRequestOptions } from "test/integration/utils/make-graphql-request.util";

export type CommonOperationInput<T> = {
  input: T;
  options?: MakeMetadataAPIRequestOptions
}