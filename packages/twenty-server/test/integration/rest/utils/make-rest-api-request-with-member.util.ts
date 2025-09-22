import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

type RestApiRequestOptions = {
  method: 'get' | 'post' | 'patch' | 'put' | 'delete';
  path: string;
  body?: Record<string, unknown>;
};

export const makeRestAPIRequestWithMember = (
  options: RestApiRequestOptions,
) => {
  return makeRestAPIRequest({
    ...options,
    bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
  });
};
