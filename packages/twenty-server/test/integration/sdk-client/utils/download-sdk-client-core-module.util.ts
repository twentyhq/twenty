import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

export const downloadSdkClientCoreModule = ({
  applicationId,
  token,
}: {
  applicationId: string;
  token?: string;
}) =>
  makeRestApiRequest({
    method: 'get',
    path: `/sdk-client/${applicationId}/core`,
    bearer: token,
  });
