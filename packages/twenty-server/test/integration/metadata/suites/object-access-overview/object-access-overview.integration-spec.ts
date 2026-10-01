import { parse } from 'graphql';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const OBJECT_ACCESS_OVERVIEW_QUERY = parse(`
  query ObjectAccessOverview($objectMetadataId: UUID!) {
    objectAccessOverview(objectMetadataId: $objectMetadataId) {
      objectMetadataId
      restrictedRecordCount
      sharedRecordCount
      roles {
        label
        canRead
        canUpdate
        canSoftDelete
        canDestroy
        hasRowFilter
        canAccessAllRecords
      }
    }
  }
`);

describe('Object access overview', () => {
  let companyObjectMetadataId: string;

  const requestObjectAccessOverview = (token: string) =>
    makeMetadataApiRequest(
      {
        query: OBJECT_ACCESS_OVERVIEW_QUERY,
        variables: { objectMetadataId: companyObjectMetadataId },
      },
      token,
    );

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
    });

    companyObjectMetadataId = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'company',
    )!.id;
  });

  it('should list what each role can do on the object', async () => {
    const response = await requestObjectAccessOverview(
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const { roles, restrictedRecordCount, sharedRecordCount } =
      response.body.data.objectAccessOverview;
    const roleByLabel = new Map(
      roles.map((role: { label: string }) => [role.label, role]),
    );

    expect(roleByLabel.get('Admin')).toEqual({
      label: 'Admin',
      canRead: true,
      canUpdate: true,
      canSoftDelete: true,
      canDestroy: true,
      hasRowFilter: false,
      canAccessAllRecords: true,
    });
    expect(roleByLabel.get('Guest')).toMatchObject({
      canUpdate: false,
      canAccessAllRecords: false,
    });
    expect(restrictedRecordCount).toBe(0);
    expect(sharedRecordCount).toBe(0);
  });

  it('should be refused to members who cannot manage the data model', async () => {
    const response = await requestObjectAccessOverview(
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  });
});
