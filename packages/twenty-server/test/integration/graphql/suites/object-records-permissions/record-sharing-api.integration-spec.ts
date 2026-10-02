import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { preserveLegacyRecordAccess } from 'src/database/commands/upgrade-version-command/2-43/utils/preserve-legacy-record-access.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';
import {
  FieldMetadataType,
  MetadataReadability,
  MetadataWritability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { setObjectReadability } from 'test/integration/metadata/suites/object-metadata/utils/set-object-readability.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { GRANTABLE_RECORD_SHARE_ACCESS_LEVELS } from 'src/engine/core-modules/record-share/constants/grantable-record-share-access-levels.constant';
import { type RecordSharePrincipalInput } from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_NAME = 'sharingPolicyRecord';
const OBJECT_PLURAL = 'sharingPolicyRecords';
const RECORD_ID = randomUUID();
const workspaceId = SEED_APPLE_WORKSPACE_ID;
const fields =
  'sharingMode canManageSharing generalAccessLevel permissions { canRead canUpdate canDelete canSoftDelete } roles { id canRead canUpdate } shares { principalId principalRoleId rowCause accessLevel }';
const READ_SHARING = parse(
  `query RecordSharing($target: RecordTargetInput!) { recordSharing(target: $target) { ${fields} } }`,
);
const SET_SHARE = parse(
  `mutation SetShare($target: RecordTargetInput!, $principal: RecordSharePrincipalInput!, $accessLevel: RecordShareAccessLevel!) { sharing: setRecordShare(target: $target, principal: $principal, accessLevel: $accessLevel) { ${fields} } }`,
);
const REMOVE_SHARE = parse(
  `mutation RemoveShare($target: RecordTargetInput!, $principal: RecordSharePrincipalInput!) { sharing: removeRecordShare(target: $target, principal: $principal) { ${fields} } }`,
);
const SET_GENERAL_ACCESS = parse(
  `mutation SetGeneralAccess($target: RecordTargetInput!, $accessLevel: RecordShareAccessLevel!) { sharing: setRecordGeneralAccess(target: $target, accessLevel: $accessLevel) { ${fields} } }`,
);

describe('Generic sharing API on an ordinary private object', () => {
  let objectMetadataId: string;
  let memberRoleId: string;
  let shares: RecordShareStorageService;
  const target = () => ({ objectMetadataId, recordId: RECORD_ID });
  const grant = async (
    accessLevel: RecordShareAccessLevel,
    rowCause = RecordShareRowCause.MANUAL,
  ) =>
    shares.insertMany({
      workspaceId,
      recordShares: [
        {
          objectMetadataId,
          recordId: RECORD_ID,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel,
          rowCause,
          sourceId: RECORD_ID,
        },
      ],
    });
  const settings = (token = APPLE_JONY_MEMBER_ACCESS_TOKEN) =>
    makeMetadataApiRequest(
      { query: READ_SHARING, variables: { target: target() } },
      token,
    );
  const share = (
    principal: RecordSharePrincipalInput,
    accessLevel = RecordShareAccessLevel.READ,
    token = APPLE_JONY_MEMBER_ACCESS_TOKEN,
  ) =>
    makeMetadataApiRequest(
      {
        query: SET_SHARE,
        variables: { target: target(), principal, accessLevel },
      },
      token,
    );
  const unshare = (
    principal: RecordSharePrincipalInput,
    token = APPLE_JONY_MEMBER_ACCESS_TOKEN,
  ) =>
    makeMetadataApiRequest(
      { query: REMOVE_SHARE, variables: { target: target(), principal } },
      token,
    );
  const setGeneralAccess = (
    accessLevel: RecordShareAccessLevel,
    token = APPLE_JONY_MEMBER_ACCESS_TOKEN,
  ) =>
    makeMetadataApiRequest(
      {
        query: SET_GENERAL_ACCESS,
        variables: { target: target(), accessLevel },
      },
      token,
    );
  const read = () =>
    makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { eq: RECORD_ID } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
  const setRoleUpdate = (canUpdateObjectRecords: boolean) =>
    upsertObjectPermissions({
      input: {
        roleId: memberRoleId,
        objectPermissions: [
          {
            objectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
          },
        ],
      },
      expectToFail: false,
    });

  it('grants edit and full access through the reusable API while preserving role restrictions', async () => {
    const principal = {
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    };
    const invite = (accessLevel: RecordShareAccessLevel) =>
      share(principal, accessLevel, APPLE_JANE_ADMIN_ACCESS_TOKEN);
    expect(
      (await invite(RecordShareAccessLevel.READ_WRITE)).body.errors,
    ).toBeUndefined();
    expect(
      (await settings()).body.data.recordSharing.permissions.canUpdate,
    ).toBe(true);
    await setRoleUpdate(false);
    expect(
      (await settings()).body.data.recordSharing.permissions.canUpdate,
    ).toBe(false);
    await setRoleUpdate(true);
    expect(
      (await invite(RecordShareAccessLevel.FULL)).body.errors,
    ).toBeUndefined();
    expect((await settings()).body.data.recordSharing.canManageSharing).toBe(
      true,
    );
  });

  beforeAll(async () => {
    shares = getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    );
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_NAME,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Sharing policy record',
        labelPlural: 'Sharing policy records',
        icon: 'IconLock',
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
    expect(
      (
        await makeGraphqlApiRequest(
          createOneOperationFactory({
            objectMetadataSingularName: OBJECT_NAME,
            gqlFields: 'id',
            data: { id: RECORD_ID, name: 'Private' },
          }),
        )
      ).body.errors,
    ).toBeUndefined();
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    await setObjectReadability(objectMetadataId, MetadataReadability.PRIVATE);
  });

  beforeEach(async () => {
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [RECORD_ID],
    });
    await shares.insertMany({
      workspaceId,
      recordShares: [
        {
          objectMetadataId,
          recordId: RECORD_ID,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: RECORD_ID,
        },
      ],
    });
  });

  afterAll(async () => {
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [RECORD_ID],
    });
    await setObjectReadability(objectMetadataId, MetadataReadability.OPEN);
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { eq: RECORD_ID } },
      }),
    );
    await updateOneObjectMetadata({
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
      expectToFail: false,
    });
    await deleteOneObjectMetadata({ input: { idToDelete: objectMetadataId } });
  });

  it('keeps creates private', async () => {
    const recordId = randomUUID();
    const created = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        gqlFields: 'id',
        data: { id: recordId, name: 'Private create' },
      }),
    );
    expect(created.body.errors).toBeUndefined();
    const recordTarget = { objectMetadataId, recordId };
    try {
      const readSettings = (token: string) =>
        makeMetadataApiRequest(
          { query: READ_SHARING, variables: { target: recordTarget } },
          token,
        );
      expect(
        (await readSettings(APPLE_JONY_MEMBER_ACCESS_TOKEN)).body.errors,
      ).toBeDefined();
      expect(
        (await readSettings(APPLE_JANE_ADMIN_ACCESS_TOKEN)).body.data
          .recordSharing,
      ).toMatchObject({
        sharingMode: 'PRIVATE',
        canManageSharing: true,
        generalAccessLevel: RecordShareAccessLevel.NONE,
        permissions: { canRead: true, canUpdate: true },
        shares: [
          expect.objectContaining({
            principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
            rowCause: 'OWNER',
            accessLevel: 'FULL',
          }),
        ],
      });
    } finally {
      await makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: OBJECT_NAME,
          objectMetadataPluralName: OBJECT_PLURAL,
          gqlFields: 'id',
          filter: { id: { eq: recordId } },
        }),
      );
    }
  });

  it('batches effective permissions without exposing absent or inaccessible records', async () => {
    const missingTarget = { objectMetadataId, recordId: randomUUID() };
    const foreignTarget = {
      objectMetadataId: randomUUID(),
      recordId: RECORD_ID,
    };
    const query = () =>
      makeMetadataApiRequest(
        {
          query: parse(
            `query Permissions($targets: [RecordTargetInput!]!) { recordPermissions(targets: $targets) { objectMetadataId recordId permissions { canRead canUpdate canDelete canSoftDelete } } }`,
          ),
          variables: { targets: [target(), missingTarget, foreignTarget] },
        },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
    const denied = {
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canSoftDelete: false,
    };
    const initial = await query();
    expect(initial.body.errors).toBeUndefined();
    expect(initial.body.data.recordPermissions).toEqual(
      [target(), missingTarget, foreignTarget].map((record) => ({
        ...record,
        permissions: denied,
      })),
    );
    await grant(RecordShareAccessLevel.READ_WRITE);
    const granted = await query();
    expect(granted.body.errors).toBeUndefined();
    expect(granted.body.data.recordPermissions).toEqual([
      {
        ...target(),
        permissions: { ...denied, canRead: true, canUpdate: true },
      },
      { ...missingTarget, permissions: denied },
      { ...foreignTarget, permissions: denied },
    ]);
    await setRoleUpdate(false);
    try {
      expect(
        (await query()).body.data.recordPermissions[0].permissions,
      ).toEqual({ ...denied, canRead: true });
    } finally {
      await setRoleUpdate(true);
    }
  });

  it('keeps deleted-record sharing available without bypassing grants or role restrictions', async () => {
    const operation = {
      objectMetadataSingularName: OBJECT_NAME,
      recordId: RECORD_ID,
      gqlFields: 'id',
    };
    const deleted = await makeGraphqlApiRequest(
      deleteOneOperationFactory(operation),
    );
    expect(deleted.body.errors).toBeUndefined();
    try {
      expect((await settings()).body.errors).toBeDefined();
      await grant(RecordShareAccessLevel.FULL);
      expect((await settings()).body.data.recordSharing).toMatchObject({
        canManageSharing: true,
        permissions: { canRead: true, canUpdate: true },
      });
      const permissions = await makeMetadataApiRequest(
        {
          query: parse(
            `query Permissions($targets: [RecordTargetInput!]!) { recordPermissions(targets: $targets) { permissions { canRead canUpdate } } }`,
          ),
          variables: { targets: [target()] },
        },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(permissions.body.data.recordPermissions[0].permissions).toEqual({
        canRead: true,
        canUpdate: true,
      });
      expect(
        (await setGeneralAccess(RecordShareAccessLevel.READ)).body.errors,
      ).toBeUndefined();
      await setRoleUpdate(false);
      expect(
        (await setGeneralAccess(RecordShareAccessLevel.NONE)).body.errors,
      ).toBeDefined();
    } finally {
      await setRoleUpdate(true);
      const restored = await makeGraphqlApiRequest(
        restoreOneOperationFactory(operation),
      );
      expect(restored.body.errors).toBeUndefined();
    }
  });

  it('matches ordinary read permissions and hides sharing audience from viewers', async () => {
    expect((await read()).body.data[OBJECT_PLURAL].edges).toEqual([]);
    expect((await settings()).body.errors).toBeDefined();
    await grant(RecordShareAccessLevel.READ);
    expect(
      (await read()).body.data[OBJECT_PLURAL].edges.map(
        ({ node }: { node: { id: string } }) => node.id,
      ),
    ).toEqual([RECORD_ID]);
    expect((await settings()).body.data.recordSharing).toMatchObject({
      permissions: { canRead: true, canUpdate: false, canDelete: false },
      canManageSharing: false,
      shares: [],
      roles: [],
    });
    expect(
      (await setGeneralAccess(RecordShareAccessLevel.READ)).body.errors,
    ).toBeDefined();
  });

  it.each([RecordShareAccessLevel.READ, RecordShareAccessLevel.READ_WRITE])(
    'refuses additions, changes, removals and self-escalation by %s recipients',
    async (accessLevel) => {
      await grant(accessLevel);
      await setGeneralAccess(
        RecordShareAccessLevel.READ,
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );
      const before = await shares.findByRecordIds({
        workspaceId,
        objectMetadataId,
        recordIds: [RECORD_ID],
      });
      const jony = { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY };
      for (const attempt of [
        () => share({ roleId: memberRoleId }, RecordShareAccessLevel.READ),
        () => setGeneralAccess(RecordShareAccessLevel.READ_WRITE),
        () => setGeneralAccess(RecordShareAccessLevel.NONE),
        () => share(jony, RecordShareAccessLevel.FULL),
        () => unshare(jony),
      ]) {
        expect((await attempt()).body.errors).toBeDefined();
      }
      expect(
        await shares.findByRecordIds({
          workspaceId,
          objectMetadataId,
          recordIds: [RECORD_ID],
        }),
      ).toEqual(before);
      expect((await settings()).body.data.recordSharing).toMatchObject({
        canManageSharing: false,
        shares: [],
        roles: [],
        permissions: {
          canUpdate: accessLevel === RecordShareAccessLevel.READ_WRITE,
        },
      });
      if (accessLevel === RecordShareAccessLevel.READ_WRITE) {
        const updated = await makeGraphqlApiRequest(
          updateOneOperationFactory({
            objectMetadataSingularName: OBJECT_NAME,
            gqlFields: 'id',
            recordId: RECORD_ID,
            data: { name: 'Updated by editor' },
          }),
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(updated.body.errors).toBeUndefined();
      }
    },
  );

  it.each(['member', 'role', 'everyone'])(
    'allows FULL from a %s grant to manage every manual level without changing managed grants',
    async (audience) => {
      await shares.insertMany({
        workspaceId,
        recordShares: [
          {
            objectMetadataId,
            recordId: RECORD_ID,
            sourceId: RECORD_ID,
            rowCause: RecordShareRowCause.MANUAL,
            accessLevel: RecordShareAccessLevel.FULL,
            principalType:
              audience === 'member'
                ? RecordSharePrincipalType.WORKSPACE_MEMBER
                : audience === 'role'
                  ? RecordSharePrincipalType.ROLE
                  : RecordSharePrincipalType.EVERYONE,
            principalId:
              audience === 'member'
                ? WORKSPACE_MEMBER_DATA_SEED_IDS.JONY
                : audience === 'role'
                  ? memberRoleId
                  : EVERYONE_PRINCIPAL_ID,
          },
          ...[RecordShareRowCause.RULE, RecordShareRowCause.APPLICATION].map(
            (rowCause) => ({
              objectMetadataId,
              recordId: RECORD_ID,
              sourceId: RECORD_ID,
              rowCause,
              accessLevel: RecordShareAccessLevel.READ,
              principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
              principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
            }),
          ),
        ],
      });
      const principal = {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      };
      for (const accessLevel of GRANTABLE_RECORD_SHARE_ACCESS_LEVELS) {
        const response = await share(principal, accessLevel);
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.sharing.canManageSharing).toBe(true);
        expect(response.body.data.sharing.shares).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              principalId: principal.workspaceMemberId,
              rowCause: 'MANUAL',
              accessLevel,
            }),
          ]),
        );
      }
      expect((await unshare(principal)).body.errors).toBeUndefined();
      const remaining = await shares.findByRecordIds({
        workspaceId,
        objectMetadataId,
        recordIds: [RECORD_ID],
      });
      expect(
        remaining
          .filter((share) => share.principalId === principal.workspaceMemberId)
          .map((share) => share.rowCause)
          .sort(),
      ).toEqual(['APPLICATION', 'OWNER', 'RULE']);
    },
  );

  it('commits self-downgrade but immediately removes grant management', async () => {
    await grant(RecordShareAccessLevel.FULL);
    const response = await share(
      { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
      RecordShareAccessLevel.READ_WRITE,
    );
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sharing).toMatchObject({
      canManageSharing: false,
      permissions: { canRead: true, canUpdate: true },
      shares: [],
      roles: [],
    });
    expect(
      (await setGeneralAccess(RecordShareAccessLevel.READ)).body.errors,
    ).toBeDefined();
  });

  it('keeps object writability above FULL grants', async () => {
    const setWritability = async (writability: MetadataWritability) => {
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).update(objectMetadataId, { writability });
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).invalidateAndRecompute(workspaceId, ['flatObjectMetadataMaps']);
    };
    await grant(RecordShareAccessLevel.FULL);
    await setWritability(MetadataWritability.SYSTEM);
    try {
      expect(
        (await settings()).body.data.recordSharing.permissions.canUpdate,
      ).toBe(false);
      expect(
        (await setGeneralAccess(RecordShareAccessLevel.READ)).body.errors,
      ).toBeDefined();
      expect(
        (
          await unshare({
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          })
        ).body.errors,
      ).toBeDefined();
    } finally {
      await setWritability(MetadataWritability.OPEN);
    }
  });

  it('keeps object role permissions above even FULL record grants', async () => {
    await grant(RecordShareAccessLevel.FULL);
    await setRoleUpdate(false);
    try {
      expect(
        (await settings()).body.data.recordSharing.permissions.canUpdate,
      ).toBe(false);
      expect(
        (await setGeneralAccess(RecordShareAccessLevel.READ)).body.errors,
      ).toBeDefined();
      const result = await makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_NAME,
          gqlFields: 'id',
          recordId: RECORD_ID,
          data: { name: 'Forbidden' },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(result.body.errors).toBeDefined();
    } finally {
      await setRoleUpdate(true);
    }
  });

  it('enforces saved grants', async () => {
    await grant(RecordShareAccessLevel.READ);
    expect((await read()).body.data[OBJECT_PLURAL].edges).toHaveLength(1);
    expect(
      (await settings(APPLE_JANE_ADMIN_ACCESS_TOKEN)).body.data.recordSharing,
    ).toMatchObject({
      sharingMode: 'PRIVATE',
      canManageSharing: true,
      permissions: { canUpdate: true },
    });
    await grant(RecordShareAccessLevel.READ, RecordShareRowCause.APPLICATION);
    expect((await read()).body.data[OBJECT_PLURAL].edges).toHaveLength(1);
    expect(
      (
        await unshare(
          { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
          APPLE_JANE_ADMIN_ACCESS_TOKEN,
        )
      ).body.errors,
    ).toBeUndefined();
    const remaining = await shares.findByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [RECORD_ID],
    });
    expect(remaining.map(({ rowCause }) => rowCause).sort()).toEqual([
      'APPLICATION',
      'OWNER',
    ]);
  });

  it('reports the role behind each member grant and what each role can do on the object', async () => {
    await grant(RecordShareAccessLevel.READ);
    const readRoles = async () => {
      const response = await settings(APPLE_JANE_ADMIN_ACCESS_TOKEN);
      expect(response.body.errors).toBeUndefined();
      return response.body.data.recordSharing;
    };
    const sharing = await readRoles();
    expect(sharing.shares).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          principalRoleId: memberRoleId,
        }),
      ]),
    );
    expect(sharing.roles).toEqual(
      expect.arrayContaining([
        { id: memberRoleId, canRead: true, canUpdate: true },
      ]),
    );
    await setRoleUpdate(false);
    try {
      expect((await readRoles()).roles).toEqual(
        expect.arrayContaining([
          { id: memberRoleId, canRead: true, canUpdate: false },
        ]),
      );
    } finally {
      await setRoleUpdate(true);
    }
  });

  it('commits self-revocation and returns a redacted response', async () => {
    await grant(RecordShareAccessLevel.FULL);
    const response = await unshare({
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sharing).toMatchObject({
      sharingMode: 'PRIVATE',
      canManageSharing: false,
      generalAccessLevel: null,
      permissions: { canRead: false, canUpdate: false },
      shares: [],
      roles: [],
    });
    expect((await read()).body.data[OBJECT_PLURAL].edges).toEqual([]);
  });

  it('serializes repeated grants and rejects missing target records', async () => {
    await grant(RecordShareAccessLevel.FULL);
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        setGeneralAccess(RecordShareAccessLevel.READ),
      ),
    );
    for (const response of responses)
      expect(response.body.errors).toBeUndefined();
    expect(
      (
        await shares.findByRecordIds({
          workspaceId,
          objectMetadataId,
          recordIds: [RECORD_ID],
        })
      ).filter(
        ({ principalType }) =>
          principalType === RecordSharePrincipalType.EVERYONE,
      ),
    ).toHaveLength(1);
    const missingId = randomUUID();
    const missing = await makeMetadataApiRequest({
      query: SET_GENERAL_ACCESS,
      variables: {
        target: { objectMetadataId, recordId: missingId },
        accessLevel: RecordShareAccessLevel.READ,
      },
    });
    expect(missing.body.errors).toBeDefined();
    expect(
      await shares.findByRecordIds({
        workspaceId,
        objectMetadataId,
        recordIds: [missingId],
      }),
    ).toEqual([]);
  });
  it('preserves legacy access once without sharing records created after the migration', async () => {
    const cache = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    const { flatObjectMetadataMaps } = await cache.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
    ]);
    const objects = Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(
        (object) =>
          object?.id === objectMetadataId ||
          object?.universalIdentifier ===
            STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      )
      .map((object) => ({
        ...object!,
        readability:
          object!.id === objectMetadataId
            ? MetadataReadability.PRIVATE
            : MetadataReadability.SYSTEM,
      }));
    const object = objects.find((item) => item.id === objectMetadataId)!;
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const runner = global.testDataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.query(
        `DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND "key" = 'COMMON_RECORD_SHARING_LEGACY_ACCESS_MIGRATED'`,
        [workspaceId],
      );
      const migration = () =>
        preserveLegacyRecordAccess({
          manager: runner.manager,
          workspaceId,
          objects,
          wasRecordSharingEnabled: false,
        });
      const threadObject = objects.find(
        (item) =>
          item.universalIdentifier ===
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      )!;
      const threadGrantsBefore = await runner.query(
        `SELECT id FROM ${schema}."recordShare" WHERE "objectMetadataId" = $1 AND "principalId" = $2 ORDER BY id`,
        [threadObject.id, EVERYONE_PRINCIPAL_ID],
      );
      await migration();
      expect(
        await runner.query(
          `SELECT id FROM ${schema}."recordShare" WHERE "objectMetadataId" = $1 AND "principalId" = $2 ORDER BY id`,
          [threadObject.id, EVERYONE_PRINCIPAL_ID],
        ),
      ).toEqual(threadGrantsBefore);
      const grants = await runner.query(
        `SELECT "accessLevel", "rowCause" FROM ${schema}."recordShare" WHERE "objectMetadataId" = $1 AND "recordId" = $2 AND "principalId" = $3`,
        [objectMetadataId, RECORD_ID, EVERYONE_PRINCIPAL_ID],
      );
      expect(grants).toEqual([
        { accessLevel: 'FULL', rowCause: 'APPLICATION' },
      ]);
      const newId = randomUUID();
      await runner.query(
        `INSERT INTO ${schema}.${escapeIdentifier(computeObjectTargetTable(object))} (id, "createdByName", "createdBySource", "updatedByName", "updatedBySource") SELECT $1, "createdByName", "createdBySource", "updatedByName", "updatedBySource" FROM ${schema}.${escapeIdentifier(computeObjectTargetTable(object))} record WHERE id = $2`,
        [newId, RECORD_ID],
      );
      await migration();
      expect(
        await runner.query(
          `SELECT id FROM ${schema}."recordShare" WHERE "recordId" = $1`,
          [newId],
        ),
      ).toEqual([]);
    } finally {
      await runner.rollbackTransaction();
      await runner.release();
    }
  });
});
