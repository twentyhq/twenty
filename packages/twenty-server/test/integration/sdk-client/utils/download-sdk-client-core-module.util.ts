import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { isDefined } from 'twenty-shared/utils';

export const downloadSdkClientCoreModule = ({
  applicationId,
  checksum,
  token,
}: {
  applicationId: string;
  checksum?: string | null;
  token?: string;
}) =>
  makeRestApiRequest({
    method: 'get',
    path: isDefined(checksum)
      ? `/sdk-client/${applicationId}/core/${checksum}`
      : `/sdk-client/${applicationId}/core`,
    bearer: token,
  });
