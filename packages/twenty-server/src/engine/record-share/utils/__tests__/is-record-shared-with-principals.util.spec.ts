import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { isRecordSharedWithPrincipals } from 'src/engine/record-share/utils/is-record-shared-with-principals.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/twenty-orm/repository/resolve-required-record-share-access-levels.util';

const OBJECT_METADATA_ID = 'object-metadata-1';
const WORKSPACE_MEMBER_ID = 'workspace-member-1';
const MEMBER_ROLE_ID = 'member-role-1';
const ADMIN_ROLE_ID = 'admin-role-1';

const RECORD_IDS = {
  SHARED_READ_WITH_MEMBER: 'record-shared-read-with-member',
  SHARED_READ_WRITE_WITH_MEMBER_ROLE:
    'record-shared-read-write-with-member-role',
  SHARED_FULL_WITH_EVERYONE: 'record-shared-full-with-everyone',
  SHARED_FULL_WITH_ADMIN_ROLE: 'record-shared-full-with-admin-role',
  UNSHARED: 'record-unshared',
};

const buildRecordShare = ({
  recordId,
  principalId,
  principalType,
  accessLevel,
}: Pick<
  RecordShare,
  'recordId' | 'principalId' | 'principalType' | 'accessLevel'
>): RecordShare => ({
  id: `${recordId}-${principalId}`,
  recordId,
  objectMetadataId: OBJECT_METADATA_ID,
  principalId,
  principalType,
  accessLevel,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: 'source-1',
});

const recordShares: RecordShare[] = [
  buildRecordShare({
    recordId: RECORD_IDS.SHARED_READ_WITH_MEMBER,
    principalId: WORKSPACE_MEMBER_ID,
    principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
    accessLevel: RecordShareAccessLevel.READ,
  }),
  buildRecordShare({
    recordId: RECORD_IDS.SHARED_READ_WRITE_WITH_MEMBER_ROLE,
    principalId: MEMBER_ROLE_ID,
    principalType: RecordSharePrincipalType.ROLE,
    accessLevel: RecordShareAccessLevel.READ_WRITE,
  }),
  buildRecordShare({
    recordId: RECORD_IDS.SHARED_FULL_WITH_EVERYONE,
    principalId: EVERYONE_PRINCIPAL_ID,
    principalType: RecordSharePrincipalType.EVERYONE,
    accessLevel: RecordShareAccessLevel.FULL,
  }),
  buildRecordShare({
    recordId: RECORD_IDS.SHARED_FULL_WITH_ADMIN_ROLE,
    principalId: ADMIN_ROLE_ID,
    principalType: RecordSharePrincipalType.ROLE,
    accessLevel: RecordShareAccessLevel.FULL,
  }),
];

const MEMBER_PRINCIPAL_IDS = [
  EVERYONE_PRINCIPAL_ID,
  WORKSPACE_MEMBER_ID,
  MEMBER_ROLE_ID,
];
const ADMIN_PRINCIPAL_IDS = [EVERYONE_PRINCIPAL_ID, ADMIN_ROLE_ID];
const EVERYONE_PRINCIPAL_IDS = [EVERYONE_PRINCIPAL_ID];

const sharedRecordIds = ({
  principalIds,
  accessLevels,
}: {
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}) =>
  Object.values(RECORD_IDS).filter((recordId) =>
    isRecordSharedWithPrincipals({
      recordShares,
      recordId,
      principalIds,
      accessLevels,
    }),
  );

describe('isRecordSharedWithPrincipals', () => {
  it.each([
    {
      principals: 'the member, their role and everyone',
      principalIds: MEMBER_PRINCIPAL_IDS,
      operationType: 'select' as const,
      expectedRecordIds: [
        RECORD_IDS.SHARED_READ_WITH_MEMBER,
        RECORD_IDS.SHARED_READ_WRITE_WITH_MEMBER_ROLE,
        RECORD_IDS.SHARED_FULL_WITH_EVERYONE,
      ],
    },
    {
      principals: 'the member, their role and everyone',
      principalIds: MEMBER_PRINCIPAL_IDS,
      operationType: 'update' as const,
      expectedRecordIds: [
        RECORD_IDS.SHARED_READ_WRITE_WITH_MEMBER_ROLE,
        RECORD_IDS.SHARED_FULL_WITH_EVERYONE,
      ],
    },
    {
      principals: 'the member, their role and everyone',
      principalIds: MEMBER_PRINCIPAL_IDS,
      operationType: 'delete' as const,
      expectedRecordIds: [RECORD_IDS.SHARED_FULL_WITH_EVERYONE],
    },
    {
      principals: 'the admin role and everyone',
      principalIds: ADMIN_PRINCIPAL_IDS,
      operationType: 'select' as const,
      expectedRecordIds: [
        RECORD_IDS.SHARED_FULL_WITH_EVERYONE,
        RECORD_IDS.SHARED_FULL_WITH_ADMIN_ROLE,
      ],
    },
    {
      principals: 'everyone alone',
      principalIds: EVERYONE_PRINCIPAL_IDS,
      operationType: 'select' as const,
      expectedRecordIds: [RECORD_IDS.SHARED_FULL_WITH_EVERYONE],
    },
    {
      principals: 'everyone alone',
      principalIds: EVERYONE_PRINCIPAL_IDS,
      operationType: 'insert' as const,
      expectedRecordIds: [],
    },
  ])(
    'should share with $principals on $operationType exactly $expectedRecordIds',
    ({ principalIds, operationType, expectedRecordIds }) => {
      expect(
        sharedRecordIds({
          principalIds,
          accessLevels: resolveRequiredRecordShareAccessLevels(operationType),
        }),
      ).toEqual(expectedRecordIds);
    },
  );

  it('should ignore rows of another record with the same principal', () => {
    expect(
      isRecordSharedWithPrincipals({
        recordShares,
        recordId: RECORD_IDS.UNSHARED,
        principalIds: [WORKSPACE_MEMBER_ID],
        accessLevels: [RecordShareAccessLevel.READ],
      }),
    ).toBe(false);
  });
});
