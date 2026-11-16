import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type TestHttpRequestFactoryInput = {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: object | string;
};

export const testHttpRequestQueryFactory = ({
  input,
}: PerformMetadataQueryParams<TestHttpRequestFactoryInput>) => ({
  query: gql`
    mutation TestHttpRequest($input: TestHttpRequestInput!) {
      testHttpRequest(input: $input) {
        success
        message
        result
        error
        status
        statusText
        headers
      }
    }
  `,
  variables: { input },
});
