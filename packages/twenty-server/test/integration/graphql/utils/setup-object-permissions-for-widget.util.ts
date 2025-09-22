import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { createUpsertObjectPermissionsOperation } from './upsert-object-permission-operation-factory.util';

export const setupObjectPermissionsForWidget = async ({
  roleId,
  objectMetadataIdWithAccess,
  objectMetadataIdWithoutAccess,
}: {
  roleId: string;
  objectMetadataIdWithAccess?: string;
  objectMetadataIdWithoutAccess?: string;
}) => {
  const objectPermissions = [];

  if (objectMetadataIdWithAccess) {
    objectPermissions.push({
      objectMetadataId: objectMetadataIdWithAccess,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
    });
  }

  if (objectMetadataIdWithoutAccess) {
    objectPermissions.push({
      objectMetadataId: objectMetadataIdWithoutAccess,
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  }

  if (objectPermissions.length === 0) {
    return;
  }

  const operation = createUpsertObjectPermissionsOperation(
    roleId,
    objectPermissions,
  );

  const response = await makeMetadataAPIRequest(operation);

  if (response.body.errors) {
    throw new Error(
      `Failed to set up object permissions: ${JSON.stringify(
        response.body.errors,
      )}`,
    );
  }

  return response.body.data.upsertObjectPermissions;
};

export const getMemberRoleId = async (): Promise<string> => {
  const getRolesOperation = {
    query: gql`
      query {
        getRoles {
          id
          label
        }
      }
    `,
  };

  const rolesResponse = await makeMetadataAPIRequest(getRolesOperation);

  if (rolesResponse.body.errors) {
    throw new Error(
      `Failed to get roles: ${JSON.stringify(rolesResponse.body.errors)}`,
    );
  }

  const memberRole = rolesResponse.body.data.getRoles.find(
    (role: any) => role.label === 'Member',
  );

  if (!memberRole) {
    throw new Error('Member role not found');
  }

  return memberRole.id;
};
