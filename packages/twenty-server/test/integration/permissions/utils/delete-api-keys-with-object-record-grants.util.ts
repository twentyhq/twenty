import { revokeApiKey } from 'test/integration/graphql/utils/revoke-api-key.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { type ApiKeyWithObjectRecordGrants } from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';

export const deleteApiKeysWithObjectRecordGrants = async (
  testApiKeys: ApiKeyWithObjectRecordGrants[],
) => {
  await Promise.all(
    testApiKeys.map(async ({ roleId, apiKeyId }) => {
      const revokeResponse = await revokeApiKey({
        apiKeyId,
        accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(revokeResponse.body.errors).toBeUndefined();

      await deleteOneRole({
        input: { idToDelete: roleId },
        expectToFail: false,
      });
    }),
  );
};
