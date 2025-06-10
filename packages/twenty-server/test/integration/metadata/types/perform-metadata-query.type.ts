export type PerformMetadataQueryParams<T> = {
  input: T;
  gqlFields?: string;
  expectToFail?: boolean;
};
