import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { PermissionFlagType } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type RecordSharePrincipalInput } from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { type RecordShareOwnershipTransferService } from 'src/engine/core-modules/record-share/services/record-share-ownership-transfer.service';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_NAME = 'allRecordsAccessRecord';
const OBJECT_PLURAL = 'allRecordsAccessRecords';
const RESTRICTED_RECORD_ID = randomUUID();
const SHARED_RECORD_ID = randomUUID();
const workspaceId = SEED_APPLE_WORKSPACE_ID;
const EVERYONE = { everyone: true };
const fields =
  'viewerAccessLevel generalAccessLevel shares { principalId rowCause accessLevel }';
const READ_SHARING = parse(
  `query RecordSharing($target: RecordSharingTargetInput!) { recordSharing(target: $target) { ${fields} } }`,
);
const SET_SHARE = parse(
  `mutation SetShare($target: RecordSharingTargetInput!, $principal: RecordSharePrincipalInput!, $enabled: Boolean!, $accessLevel: RecordShareAccessLevel) { setRecordShare(target: $target, principal: $principal, enabled: $enabled, accessLevel: $accessLevel) { ${fields} } }`,
);

describe('Access to all records and ownership transfer', () => {
  let objectMetadataId: string;
  let shares: RecordShareStorageService;

  const target = (recordId: string) => ({ objectMetadataId, recordId });

  const setRecordSharingEnabled = (value: boolean) =>
    updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value,
      expectToFail: false,
    });

  const setShare = ({
    recordId,
    principal,
    enabled,
    accessLevel = RecordShareAccessLevel.READ,
    token,
  }: {
    recordId: string;
    principal: RecordSharePrincipalInput;
    enabled: boolean;
    accessLevel?: RecordShareAccessLevel;
    token: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: SET_SHARE,
        variables: {
          target: target(recordId),
          principal,
          enabled,
          accessLevel,
        },
      },
      token,
    );

  const findRecordIds = async (token: string) => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { in: [RESTRICTED_RECORD_ID, SHARED_RECORD_ID] } },
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data[OBJECT_PLURAL].edges
      .map(({ node }: { node: { id: string } }) => node.id)
      .sort();
  };

  const findMemberGrants = async (workspaceMemberId: string) =>
    (
      await shares.findByRecordIds({
        workspaceId,
        objectMetadataId,
        recordIds: [RESTRICTED_RECORD_ID, SHARED_RECORD_ID],
      })
    )
      .filter(
        (share) =>
          share.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER &&
          share.principalId === workspaceMemberId,
      )
      .map(({ recordId, accessLevel, rowCause }) => ({
        recordId,
        accessLevel,
        rowCause,
      }));

  beforeAll(async () => {
    shares = getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    );
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_NAME,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'All records access record',
        labelPlural: 'All records access records',
        icon: 'IconShare',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = data.createOneObject.id;
    await createOneFieldMetadata({
      input: {
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: false,
      },
    });
    await setRecordSharingEnabled(true);
  });

  beforeEach(async () => {
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [RESTRICTED_RECORD_ID, SHARED_RECORD_ID],
    });
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { in: [RESTRICTED_RECORD_ID, SHARED_RECORD_ID] } },
      }),
    );

    for (const recordId of [RESTRICTED_RECORD_ID, SHARED_RECORD_ID]) {
      const created = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: OBJECT_NAME,
          gqlFields: 'id',
          data: { id: recordId, name: 'Created by Jony' },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(created.body.errors).toBeUndefined();

      const restricted = await setShare({
        recordId,
        principal: EVERYONE,
        enabled: false,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(restricted.body.errors).toBeUndefined();
    }
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [RESTRICTED_RECORD_ID, SHARED_RECORD_ID],
    });
    await updateOneObjectMetadata({
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
      expectToFail: false,
    });
    await deleteOneObjectMetadata({ input: { idToDelete: objectMetadataId } });
  });

  it('should show restricted records to admins and no one else', async () => {
    expect(await findRecordIds(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toEqual(
      [RESTRICTED_RECORD_ID, SHARED_RECORD_ID].sort(),
    );
    expect(await findRecordIds(APPLE_PHIL_GUEST_ACCESS_TOKEN)).toEqual([]);
  });

  it('should let admins manage access to restricted records', async () => {
    const sharing = await makeMetadataApiRequest(
      {
        query: READ_SHARING,
        variables: { target: target(RESTRICTED_RECORD_ID) },
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(sharing.body.errors).toBeUndefined();
    expect(sharing.body.data.recordSharing.viewerAccessLevel).toBe(
      RecordShareAccessLevel.FULL,
    );

    const shared = await setShare({
      recordId: RESTRICTED_RECORD_ID,
      principal: { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL },
      enabled: true,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(shared.body.errors).toBeUndefined();
    expect(await findRecordIds(APPLE_PHIL_GUEST_ACCESS_TOKEN)).toEqual([
      RESTRICTED_RECORD_ID,
    ]);
  });

  it('should show restricted records to any role given the permission', async () => {
    const guestRoleId = (await findOneRoleByLabel({ label: 'Guest' })).id;
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: `All records auditor ${randomUUID()}`,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });
    const auditorRoleId = data.createOneRole.id;
    const assignRoleToPhil = (roleId: string) =>
      updateWorkspaceMemberRole({
        expectToFail: false,
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
          roleId,
        },
      });

    try {
      await assignRoleToPhil(auditorRoleId);
      expect(await findRecordIds(APPLE_PHIL_GUEST_ACCESS_TOKEN)).toEqual([]);

      await upsertPermissionFlags({
        expectToFail: false,
        input: {
          roleId: auditorRoleId,
          permissionFlagKeys: [PermissionFlagType.ACCESS_ALL_RECORDS],
        },
      });
      expect(await findRecordIds(APPLE_PHIL_GUEST_ACCESS_TOKEN)).toEqual(
        [RESTRICTED_RECORD_ID, SHARED_RECORD_ID].sort(),
      );
    } finally {
      try {
        await assignRoleToPhil(guestRoleId);
      } finally {
        await deleteOneRole({
          expectToFail: false,
          input: { idToDelete: auditorRoleId },
        });
      }
    }
  });

  it('should lift restrictions for everyone while record sharing is off', async () => {
    await setRecordSharingEnabled(false);

    try {
      expect(await findRecordIds(APPLE_PHIL_GUEST_ACCESS_TOKEN)).toEqual(
        [RESTRICTED_RECORD_ID, SHARED_RECORD_ID].sort(),
      );
    } finally {
      await setRecordSharingEnabled(true);
    }
  });

  it('should hand the records a removed member managed to the custodian', async () => {
    await setShare({
      recordId: SHARED_RECORD_ID,
      principal: { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL },
      enabled: true,
      accessLevel: RecordShareAccessLevel.FULL,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    await setShare({
      recordId: RESTRICTED_RECORD_ID,
      principal: { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL },
      enabled: true,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    await setShare({
      recordId: SHARED_RECORD_ID,
      principal: { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE },
      enabled: true,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
    });
    const chatThreadObjectMetadataId = objects.find(
      (object) => object.nameSingular === 'agentChatThread',
    )!.id;
    const privateChatThreadId = randomUUID();

    await shares.insertMany({
      workspaceId,
      recordShares: [
        {
          objectMetadataId: chatThreadObjectMetadataId,
          recordId: privateChatThreadId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: privateChatThreadId,
        },
      ],
    });

    try {
      await getAppProviderByClassName<RecordShareOwnershipTransferService>(
        'RecordShareOwnershipTransferService',
      ).transferRecordSharesToCustodian({
        removedUserWorkspace: await getCoreRepository<UserWorkspaceEntity>(
          UserWorkspaceEntity,
        ).findOneByOrFail({ id: USER_WORKSPACE_DATA_SEED_IDS.PHIL }),
        removedWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
        actingUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      });

      expect(
        await findMemberGrants(WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL),
      ).toEqual([]);
      expect(
        await findMemberGrants(WORKSPACE_MEMBER_DATA_SEED_IDS.JANE),
      ).toEqual([
        {
          recordId: SHARED_RECORD_ID,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.MANUAL,
        },
      ]);
      expect(
        await findMemberGrants(WORKSPACE_MEMBER_DATA_SEED_IDS.JONY),
      ).toEqual(
        expect.arrayContaining([
          {
            recordId: RESTRICTED_RECORD_ID,
            accessLevel: RecordShareAccessLevel.FULL,
            rowCause: RecordShareRowCause.OWNER,
          },
        ]),
      );

      const chatThreadShares = await shares.findByRecordIds({
        workspaceId,
        objectMetadataId: chatThreadObjectMetadataId,
        recordIds: [privateChatThreadId],
      });

      expect(chatThreadShares.map(({ principalId }) => principalId)).toEqual([
        WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
      ]);
    } finally {
      await shares.deleteByRecordIds({
        workspaceId,
        objectMetadataId: chatThreadObjectMetadataId,
        recordIds: [privateChatThreadId],
      });
    }
  });
});
