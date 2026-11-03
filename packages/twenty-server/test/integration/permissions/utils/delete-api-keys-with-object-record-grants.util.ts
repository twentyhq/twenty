import gql from 'graphql-tag';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type ApiKeyWithObjectRecordGrants } from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';

export const deleteApiKeysWithObjectRecordGrants = async (
  testApiKeys: ApiKeyWithObjectRecordGrants[],
) => {
  for (const { roleId, apiKeyId } of testApiKeys) {
    const revokeResponse = await makeMetadataApiRequest({
      query: gql`
        mutation RevokeApiKey($input: RevokeApiKeyInput!) {
          revokeApiKey(input: $input) {
            id
          }
        }
      `,
      variables: { input: { id: apiKeyId } },
    });

    expect(revokeResponse.body.errors).toBeUndefined();

    await deleteOneRole({ input: { idToDelete: roleId }, expectToFail: false });
  }
};
