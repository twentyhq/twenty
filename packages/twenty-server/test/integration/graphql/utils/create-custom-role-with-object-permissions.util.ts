import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const createCustomRoleWithObjectPermissions = async (options: {
  label: string;
  canReadPerson?: boolean;
  canReadCompany?: boolean;
  canReadOpportunities?: boolean;
  hasAllObjectRecordsReadPermission?: boolean;
}) => {
  const createRoleOperation = {
    query: gql`
        mutation CreateOneRole {
          createOneRole(createRoleInput: {
            label: "${options.label}"
            description: "Test role for permission testing"
            canUpdateAllSettings: ${options.hasAllObjectRecordsReadPermission ?? true}
            canReadAllObjectRecords: ${options.hasAllObjectRecordsReadPermission ?? true}
            canUpdateAllObjectRecords: ${options.hasAllObjectRecordsReadPermission ?? true}
            canSoftDeleteAllObjectRecords: ${options.hasAllObjectRecordsReadPermission ?? true}
            canDestroyAllObjectRecords: ${options.hasAllObjectRecordsReadPermission ?? true}
          }) {
            id
            label
          }
        }
      `,
  };

  const response = await makeGraphqlAPIRequest(createRoleOperation);

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.createOneRole).toBeDefined();
  const roleId = response.body.data.createOneRole.id;

  // Get object metadata IDs for Person and Company
  const getObjectMetadataOperation = {
    query: gql`
      query {
        objects(paging: { first: 1000 }) {
          edges {
            node {
              id
              nameSingular
            }
          }
        }
      }
    `,
  };

  const objectMetadataResponse = await makeMetadataAPIRequest(
    getObjectMetadataOperation,
  );
  const objects = objectMetadataResponse.body.data.objects.edges;

  const personObjectId = objects.find(
    (obj: any) => obj.node.nameSingular === 'person',
  )?.node.id;
  const companyObjectId = objects.find(
    (obj: any) => obj.node.nameSingular === 'company',
  )?.node.id;
  const opportunityObjectId = objects.find(
    (obj: any) => obj.node.nameSingular === 'opportunity',
  )?.node.id;

  // Create object permissions based on the options
  const objectPermissions = [];

  if (options.canReadPerson !== undefined) {
    objectPermissions.push({
      objectMetadataId: personObjectId,
      canReadObjectRecords: options.canReadPerson,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  }

  if (options.canReadCompany !== undefined) {
    objectPermissions.push({
      objectMetadataId: companyObjectId,
      canReadObjectRecords: options.canReadCompany,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  }

  if (options.canReadOpportunities !== undefined) {
    objectPermissions.push({
      objectMetadataId: opportunityObjectId,
      canReadObjectRecords: options.canReadOpportunities,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  }

  if (objectPermissions.length > 0) {
    const upsertObjectPermissionsOperation = {
      query: gql`
        mutation UpsertObjectPermissions(
          $roleId: String!
          $objectPermissions: [ObjectPermissionInput!]!
        ) {
          upsertObjectPermissions(
            upsertObjectPermissionsInput: {
              roleId: $roleId
              objectPermissions: $objectPermissions
            }
          ) {
            objectMetadataId
            canReadObjectRecords
          }
        }
      `,
      variables: {
        roleId,
        objectPermissions,
      },
    };

    await makeGraphqlAPIRequest(upsertObjectPermissionsOperation);
  }

  return {
    roleId,
    personObjectId,
    companyObjectId,
    opportunityObjectId,
  };
};
