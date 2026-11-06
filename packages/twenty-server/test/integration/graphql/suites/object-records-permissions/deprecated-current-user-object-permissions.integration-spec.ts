import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

type ObjectRecordsPermissions = {
  objectMetadataId: string;
  canReadAllRecords: boolean;
  canUpdateAllRecords: boolean;
  canSoftDeleteAllRecords: boolean;
  canDestroyAllRecords: boolean;
  restrictedFields: Record<string, unknown>;
  rowLevelRecordsPermissions: {
    canReadRecords: boolean;
    canUpdateRecords: boolean;
    canSoftDeleteRecords: boolean;
    canDestroyRecords: boolean;
    predicates: { id: string }[];
    predicateGroups: { id: string }[];
  } | null;
};

const CURRENT_USER_OBJECT_PERMISSIONS_FIELDS = `
  objectMetadataId
  canReadObjectRecords
  canUpdateObjectRecords
  canSoftDeleteObjectRecords
  canDestroyObjectRecords
  restrictedFields
  rowLevelPermissionPredicates {
    id
  }
  rowLevelPermissionPredicateGroups {
    id
  }
`;

const buildExpectedObjectPermission = ({
  objectMetadataId,
  canReadAllRecords,
  canUpdateAllRecords,
  canSoftDeleteAllRecords,
  canDestroyAllRecords,
  restrictedFields,
  rowLevelRecordsPermissions,
}: ObjectRecordsPermissions) => ({
  objectMetadataId,
  canReadObjectRecords:
    canReadAllRecords || (rowLevelRecordsPermissions?.canReadRecords ?? false),
  canUpdateObjectRecords:
    canUpdateAllRecords ||
    (rowLevelRecordsPermissions?.canUpdateRecords ?? false),
  canSoftDeleteObjectRecords:
    canSoftDeleteAllRecords ||
    (rowLevelRecordsPermissions?.canSoftDeleteRecords ?? false),
  canDestroyObjectRecords:
    canDestroyAllRecords ||
    (rowLevelRecordsPermissions?.canDestroyRecords ?? false),
  restrictedFields,
  rowLevelPermissionPredicates: rowLevelRecordsPermissions?.predicates ?? [],
  rowLevelPermissionPredicateGroups:
    rowLevelRecordsPermissions?.predicateGroups ?? [],
});

describe('deprecated current user object permissions', () => {
  it('serves front bundles still reading the legacy shape from the records permissions', async () => {
    const response = await makeMetadataApiRequest({
      query: gql`
        query CurrentUserDeprecatedObjectPermissions {
          currentUser {
            currentUserWorkspace {
              objectRecordsPermissions {
                objectMetadataId
                canReadAllRecords
                canUpdateAllRecords
                canSoftDeleteAllRecords
                canDestroyAllRecords
                restrictedFields
                rowLevelRecordsPermissions {
                  canReadRecords
                  canUpdateRecords
                  canSoftDeleteRecords
                  canDestroyRecords
                  predicates {
                    id
                  }
                  predicateGroups {
                    id
                  }
                }
              }
              objectPermissions {
                ${CURRENT_USER_OBJECT_PERMISSIONS_FIELDS}
              }
              objectsPermissions {
                ${CURRENT_USER_OBJECT_PERMISSIONS_FIELDS}
              }
            }
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();

    const { objectRecordsPermissions, objectPermissions, objectsPermissions } =
      response.body.data.currentUser.currentUserWorkspace;

    const expectedObjectPermissions = objectRecordsPermissions.map(
      buildExpectedObjectPermission,
    );

    expect(expectedObjectPermissions.length).toBeGreaterThan(0);
    expect(objectPermissions).toEqual(expectedObjectPermissions);
    expect(objectsPermissions).toEqual(expectedObjectPermissions);
  });
});
