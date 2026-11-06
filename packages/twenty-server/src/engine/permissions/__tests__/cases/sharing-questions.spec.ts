import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { buildPermissionCacheValues } from 'src/engine/permissions/__tests__/framework/build-permission-cache-values.util';
import { buildPermissionServices } from 'src/engine/permissions/__tests__/framework/build-permission-services.util';
import {
  MAIN_ROLE_ID,
  MEMBER_ID,
  OBJECT_ID,
  OTHER_MEMBER_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { type RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';
import { RecordSharingPermissionsService } from 'src/engine/permissions/record-sharing-permissions.service';

const RECORD_ID = 'record-id';

const QUESTION = {
  workspaceId: WORKSPACE_ID,
  objectMetadataId: OBJECT_ID,
  recordId: RECORD_ID,
};

const buildService = (
  shares: {
    principalId: string;
    principalType?: RecordSharePrincipalType;
    accessLevel: RecordShareAccessLevel;
  }[],
) => {
  const services = buildPermissionServices({
    cacheValues: buildPermissionCacheValues({ isSharingEnabled: true }),
  });

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

describe('canRoleUpdateSharedRecord', () => {
  it.each<{
    it: string;
    principalId: string;
    accessLevel: RecordShareAccessLevel;
    isGranted: boolean;
  }>([
    {
      it: 'read',
      principalId: MAIN_ROLE_ID,
      accessLevel: RecordShareAccessLevel.READ,
      isGranted: false,
    },
    {
      it: 'write',
      principalId: MAIN_ROLE_ID,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      isGranted: true,
    },
    {
      it: 'full',
      principalId: MAIN_ROLE_ID,
      accessLevel: RecordShareAccessLevel.FULL,
      isGranted: true,
    },
    {
      it: 'no access',
      principalId: MAIN_ROLE_ID,
      accessLevel: RecordShareAccessLevel.NONE,
      isGranted: false,
    },
    {
      it: 'write for another role',
      principalId: 'other-role-id',
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      isGranted: false,
    },
  ])('$it', async ({ principalId, accessLevel, isGranted }) => {
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
  it.each<{
    it: string;
    principalId: string;
    principalType: RecordSharePrincipalType;
    isShared: boolean;
  }>([
    {
      it: 'the member only',
      principalId: MEMBER_ID,
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      isShared: false,
    },
    {
      it: 'another member',
      principalId: OTHER_MEMBER_ID,
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      isShared: true,
    },
    {
      it: 'a role',
      principalId: MAIN_ROLE_ID,
      principalType: RecordSharePrincipalType.ROLE,
      isShared: true,
    },
  ])('$it', async ({ principalId, principalType, isShared }) => {
    expect(
      await buildService([
        {
          principalId,
          principalType,
          accessLevel: RecordShareAccessLevel.READ,
        },
      ]).isRecordSharedBeyondMember({
        ...QUESTION,
        workspaceMemberId: MEMBER_ID,
      }),
    ).toBe(isShared);
  });
});
