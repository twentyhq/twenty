export type PerformMetadataQueryParams<T> = {
  input: T;
  gqlFields?: string;
  expectToFail?: boolean | null;
  token?: string;
};
