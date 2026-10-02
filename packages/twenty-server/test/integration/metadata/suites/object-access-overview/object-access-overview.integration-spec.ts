import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_ACCESS_OVERVIEW_QUERY = parse(`
  query ObjectAccessOverview($objectMetadataId: UUID!) {
    objectAccessOverview(objectMetadataId: $objectMetadataId) {
      restrictedRecordCount
      sharedRecordCount
      roles {
        id
        label
        canRead
        canUpdate
        canSoftDelete
        hasRowFilter
      }
    }
  }
`);

type OverviewRole = {
  id: string;
  label: string;
  hasRowFilter: boolean;
};

describe('Object access overview', () => {
  const restrictedRecordId = randomUUID();
  const sharedRecordId = randomUUID();
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;
  let shares: RecordShareStorageService;

  const requestObjectAccessOverview = (token: string) =>
    makeMetadataApiRequest(
      {
        query: OBJECT_ACCESS_OVERVIEW_QUERY,
        variables: { objectMetadataId: companyObjectMetadataId },
      },
      token,
    );

  beforeAll(async () => {
    shares = getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    );

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular fieldsList { id name }',
    });
    const company = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'company',
    )!;

    companyObjectMetadataId = company.id;
    companyNameFieldMetadataId = company.fieldsList!.find(
      (field) => field.name === 'name',
    )!.id;
  });

  afterEach(async () => {
    await shares.deleteByRecordIds({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId: companyObjectMetadataId,
      recordIds: [restrictedRecordId, sharedRecordId],
    });
  });

  it('should list what each role can do on the object', async () => {
    const response = await requestObjectAccessOverview(
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const roleByLabel = new Map(
      response.body.data.objectAccessOverview.roles.map(
        (role: OverviewRole) => [role.label, role],
      ),
    );
    const adminRole = await findOneRoleByLabel({ label: 'Admin' });

    expect(roleByLabel.get('Admin')).toEqual({
      id: adminRole.id,
      label: 'Admin',
      canRead: true,
      canUpdate: true,
      canSoftDelete: true,
      hasRowFilter: false,
    });
    expect(roleByLabel.get('Guest')).toMatchObject({
      canUpdate: false,
    });
  });

  it('should flag a role whose row filter limits it to some records', async () => {
    const memberRole = await findOneRoleByLabel({ label: 'Member' });

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: memberRole.id,
        objectMetadataId: companyObjectMetadataId,
        predicates: [
          {
            fieldMetadataId: companyNameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Visible',
          },
        ],
        predicateGroups: [],
      },
    });

    try {
      const response = await requestObjectAccessOverview(
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(
        response.body.data.objectAccessOverview.roles.find(
          (role: OverviewRole) => role.id === memberRole.id,
        ),
      ).toMatchObject({ hasRowFilter: true });
    } finally {
      await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId: memberRole.id,
          objectMetadataId: companyObjectMetadataId,
          predicates: [],
          predicateGroups: [],
        },
      });
    }
  });

  it('should count restricted records and records shared with specific people', async () => {
    await shares.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        {
          objectMetadataId: companyObjectMetadataId,
          recordId: restrictedRecordId,
          principalType: RecordSharePrincipalType.EVERYONE,
          principalId: EVERYONE_PRINCIPAL_ID,
          accessLevel: RecordShareAccessLevel.NONE,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId: restrictedRecordId,
        },
        {
          objectMetadataId: companyObjectMetadataId,
          recordId: sharedRecordId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId: sharedRecordId,
        },
      ],
    });

    const response = await requestObjectAccessOverview(
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.data.objectAccessOverview).toMatchObject({
      restrictedRecordCount: 1,
      sharedRecordCount: 1,
    });
  });

  it('should report an unknown object as not found', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: OBJECT_ACCESS_OVERVIEW_QUERY,
        variables: { objectMetadataId: randomUUID() },
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
  });

  it('should be refused to members who cannot manage the data model', async () => {
    const response = await requestObjectAccessOverview(
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  });
});
