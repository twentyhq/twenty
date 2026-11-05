import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { buildMatrixServices } from 'src/engine/permissions/__tests__/record-access-matrix/build-matrix-services.util';
import {
  MAIN_ROLE_ID,
  WORKSPACE_MEMBER_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.model';
import {
  buildMatrixCacheValues,
  OBJECT_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.world';
import { RecordSharingPermissionsService } from 'src/engine/permissions/record-sharing-permissions.service';
import { type RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';

const RECORD_ID = 'record-id';

const buildService = (
  shares: {
    principalId: string;
    principalType?: RecordSharePrincipalType;
    accessLevel: RecordShareAccessLevel;
  }[],
) => {
  const services = buildMatrixServices(
    buildMatrixCacheValues({
      mainRoleGrant: 'none',
      limitingRoleGrant: 'none',
      isSharingEnabled: true,
    }),
  );

  return new RecordSharingPermissionsService(
    services.recordAccessDecisionService,
    services.workspaceCacheService,
    {
      findRecordShares: async () =>
        shares.map((share) => ({ ...share, recordId: RECORD_ID })),
    } as unknown as RecordPermissionReadOrmService,
    services.recordPermissionsService,
    services.principalPermissionsService,
  );
};

const QUESTION = {
  workspaceId: WORKSPACE_ID,
  objectMetadataId: OBJECT_ID,
  recordId: RECORD_ID,
};

describe('record sharing questions', () => {
  describe('canRoleUpdateSharedRecord', () => {
    it.each<[string, string, RecordShareAccessLevel, boolean]>([
      ['read', MAIN_ROLE_ID, RecordShareAccessLevel.READ, false],
      ['write', MAIN_ROLE_ID, RecordShareAccessLevel.READ_WRITE, true],
      ['full', MAIN_ROLE_ID, RecordShareAccessLevel.FULL, true],
      ['no access', MAIN_ROLE_ID, RecordShareAccessLevel.NONE, false],
      [
        'write for another role',
        'other-role-id',
        RecordShareAccessLevel.READ_WRITE,
        false,
      ],
    ])('%s', async (_name, principalId, accessLevel, isGranted) => {
      expect(
        await buildService([
          { principalId, accessLevel },
        ]).canRoleUpdateSharedRecord({ ...QUESTION, roleId: MAIN_ROLE_ID }),
      ).toBe(isGranted);
    });

    it('answers no for a record without shares', async () => {
      expect(
        await buildService([]).canRoleUpdateSharedRecord({
          ...QUESTION,
          roleId: MAIN_ROLE_ID,
        }),
      ).toBe(false);
    });
  });

  describe('isRecordSharedBeyondMember', () => {
    it.each<[string, string, RecordSharePrincipalType, boolean]>([
      [
        'the member only',
        WORKSPACE_MEMBER_ID,
        RecordSharePrincipalType.WORKSPACE_MEMBER,
        false,
      ],
      [
        'another member',
        'other-member-id',
        RecordSharePrincipalType.WORKSPACE_MEMBER,
        true,
      ],
      ['a role', MAIN_ROLE_ID, RecordSharePrincipalType.ROLE, true],
    ])('%s', async (_name, principalId, principalType, isShared) => {
      expect(
        await buildService([
          {
            principalId,
            principalType,
            accessLevel: RecordShareAccessLevel.READ,
          },
        ]).isRecordSharedBeyondMember({
          ...QUESTION,
          workspaceMemberId: WORKSPACE_MEMBER_ID,
        }),
      ).toBe(isShared);
    });
  });
});
