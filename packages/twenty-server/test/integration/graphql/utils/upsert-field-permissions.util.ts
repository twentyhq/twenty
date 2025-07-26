import { createUpsertFieldPermissionsOperation } from 'test/integration/graphql/utils/upsert-field-permissions-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const upsertFieldPermissions = async ({
  roleId,
  fieldPermissions,
  selectedFields,
}: {
  roleId: string;
  fieldPermissions: Array<{
    objectMetadataId: string;
    fieldMetadataId: string;
    canReadFieldValue?: boolean | null;
    canUpdateFieldValue?: boolean | null;
  }>;
  selectedFields?: string[];
}) => {
  const operation = createUpsertFieldPermissionsOperation(
    roleId,
    fieldPermissions,
    selectedFields,
  );

  const response = await makeMetadataAPIRequest(operation);

  return {
    data: response.body.data,
    errors: response.body.errors,
  };
};
