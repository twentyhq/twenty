import {
  type TestHttpRequestFactoryInput,
  testHttpRequestQueryFactory,
} from 'test/integration/graphql/suites/workflow/utils/test-http-request-query-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

type TestHttpRequestOutput = {
  success: boolean;
  message: string;
  result?: unknown;
  error?: unknown;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
};

export const testHttpRequest = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<TestHttpRequestFactoryInput>): CommonResponseBody<{
  testHttpRequest: TestHttpRequestOutput | null;
}> => {
  const response = await makeGraphqlApiRequest(
    testHttpRequestQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Testing an HTTP request should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Testing an HTTP request has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
