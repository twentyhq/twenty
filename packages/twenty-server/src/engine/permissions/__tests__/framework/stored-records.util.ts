import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { OTHER_MEMBER_ID } from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';

export type RecordShareFixture = {
  principalId: string;
  accessLevel: RecordShareAccessLevel;
};

export type RecordFixture = {
  isPrivate?: boolean;
  createdBy?: string;
  share?: RecordShareFixture;
  isOutsideMainRoleFilter?: boolean;
  isOutsideLimitingRoleFilter?: boolean;
  isOutsideApplicationRoleFilter?: boolean;
};

export type StoredRecordFixture = RecordFixture & { id: string };

export const EVERYONE = EVERYONE_PRINCIPAL_ID;

export const read = (principalId: string): RecordShareFixture => ({
  principalId,
  accessLevel: RecordShareAccessLevel.READ,
});

export const readWrite = (principalId: string): RecordShareFixture => ({
  principalId,
  accessLevel: RecordShareAccessLevel.READ_WRITE,
});

export const fullAccess = (principalId: string): RecordShareFixture => ({
  principalId,
  accessLevel: RecordShareAccessLevel.FULL,
});

export const noAccess = (principalId: string): RecordShareFixture => ({
  principalId,
  accessLevel: RecordShareAccessLevel.NONE,
});

export const buildStoredRecords = (fixtures: StoredRecordFixture[]) => ({
  records: fixtures.map((fixture) => ({
    id: fixture.id,
    status: fixture.isOutsideMainRoleFilter ? 'archived' : 'active',
    category: fixture.isOutsideLimitingRoleFilter ? 'other' : 'core',
    region: fixture.isOutsideApplicationRoleFilter ? 'americas' : 'europe',
    deletedAt: null,
  })),
  shares: fixtures.flatMap(({ id, share }) =>
    isDefined(share) ? [{ ...share, recordId: id }] : [],
  ),
  privateRecordStates: new Map(
    fixtures.map((fixture) => [
      fixture.id,
      {
        isPrivate: fixture.isPrivate ?? false,
        createdByWorkspaceMemberId: fixture.createdBy ?? OTHER_MEMBER_ID,
      },
    ]),
  ),
});

export type StoredRecords = ReturnType<typeof buildStoredRecords>;
