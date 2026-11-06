import { createApiKeyOperationFactory } from 'test/integration/graphql/utils/create-api-key-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const createApiKey = async ({
  name,
  expiresAt,
  roleId,
  accessToken,
}: {
  name: string;
  expiresAt: string;
  roleId: string;
  accessToken: string;
}) =>
  makeMetadataApiRequest(
    createApiKeyOperationFactory({ name, expiresAt, roleId }),
    accessToken,
  );
