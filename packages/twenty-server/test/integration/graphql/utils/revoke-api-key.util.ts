import { revokeApiKeyOperationFactory } from 'test/integration/graphql/utils/revoke-api-key-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const revokeApiKey = async ({
  apiKeyId,
  accessToken,
}: {
  apiKeyId: string;
  accessToken: string;
}) =>
  makeMetadataApiRequest(
    revokeApiKeyOperationFactory({ apiKeyId }),
    accessToken,
  );
