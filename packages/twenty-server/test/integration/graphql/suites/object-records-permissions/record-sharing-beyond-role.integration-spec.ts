import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  ObjectSharingReach,
  RecordShareAccessLevel,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RecordSharePrincipalInput } from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { type RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_NAME = 'beyondRoleRecord';
const OBJECT_PLURAL = 'beyondRoleRecords';
const SHARED_RECORD_ID = randomUUID();
const OTHER_RECORD_ID = randomUUID();
const workspaceId = SEED_APPLE_WORKSPACE_ID;
const JONY = { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY };
const EVERYONE = { everyone: true };
const SET_SHARE = parse(
  `mutation SetShare($target: RecordSharingTargetInput!, $principal: RecordSharePrincipalInput!, $enabled: Boolean!, $accessLevel: RecordShareAccessLevel) { setRecordShare(target: $target, principal: $principal, enabled: $enabled, accessLevel: $accessLevel) { viewerAccessLevel } }`,
);
const READ_SHARING = parse(
  `query RecordSharing($target: RecordSharingTargetInput!) { recordSharing(target: $target) { viewerAccessLevel permissions { canRead canUpdate canDelete } shares { principalId } } }`,
);

describe('Records shared beyond the role that can access their object', () => {
  let objectMetadataId: string;
  let nameFieldMetadataId: string;
  let memberRoleId: string;
  let shares: RecordShareStorageService;
  const target = (recordId = SHARED_RECORD_ID) => ({
    objectMetadataId,
    recordId,
  });

  const setRecordSharingEnabled = (value: boolean) =>
    updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value,
      expectToFail: false,
    });

  const setShare = ({
    principal,
    enabled = true,
    accessLevel = RecordShareAccessLevel.READ,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }: {
    principal: RecordSharePrincipalInput;
    enabled?: boolean;
    accessLevel?: RecordShareAccessLevel;
    token?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: SET_SHARE,
        variables: { target: target(), principal, enabled, accessLevel },
      },
      token,
    );

  const setMemberObjectAccess = (canAccessObject: boolean) =>
    upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: memberRoleId,
        objectPermissions: [
          {
            objectMetadataId,
            canReadObjectRecords: canAccessObject,
            canUpdateObjectRecords: canAccessObject,
            canSoftDeleteObjectRecords: canAccessObject,
            canDestroyObjectRecords: canAccessObject,
          },
        ],
      },
    });

  const setSharingReach = (sharingReach: ObjectSharingReach) =>
    updateOneObjectMetadata({
      expectToFail: false,
      input: { idToUpdate: objectMetadataId, updatePayload: { sharingReach } },
    });

  const findIdsAsJony = async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id name',
        filter: { id: { in: [SHARED_RECORD_ID, OTHER_RECORD_ID] } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    return {
      errors: response.body.errors,
      ids: (response.body.data?.[OBJECT_PLURAL]?.edges ?? []).map(
        ({ node }: { node: { id: string } }) => node.id,
      ),
    };
  };

  const renameAsJony = (name: string) =>
    makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        gqlFields: 'id',
        recordId: SHARED_RECORD_ID,
        data: { name },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

  beforeAll(async () => {
    shares = getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    );
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_NAME,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Beyond role record',
        labelPlural: 'Beyond role records',
        icon: 'IconShare',
        isLabelSyncedWithName: false,
      },
      gqlFields: 'id labelIdentifierFieldMetadataId',
    });

    objectMetadataId = data.createOneObject.id;
    // Custom objects come with a name field as their label identifier
    nameFieldMetadataId = data.createOneObject.labelIdentifierFieldMetadataId!;

    for (const [id, name] of [
      [SHARED_RECORD_ID, 'Shared'],
      [OTHER_RECORD_ID, 'Visible'],
    ]) {
      const created = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: OBJECT_NAME,
          gqlFields: 'id',
          data: { id, name },
        }),
      );

      expect(created.body.errors).toBeUndefined();
    }

    await setRecordSharingEnabled(true);
  });

  beforeEach(async () => {
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [SHARED_RECORD_ID, OTHER_RECORD_ID],
    });
    await setMemberObjectAccess(false);
    await setSharingReach(ObjectSharingReach.WORKSPACE);
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);
    await setMemberObjectAccess(true);
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [SHARED_RECORD_ID, OTHER_RECORD_ID],
    });
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { in: [SHARED_RECORD_ID, OTHER_RECORD_ID] } },
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

  it('should show nothing to a role without access until a record is named for it', async () => {
    expect(await findIdsAsJony()).toEqual({ errors: undefined, ids: [] });
  });

  it('should reach only the record named for the member', async () => {
    expect((await setShare({ principal: JONY })).body.errors).toBeUndefined();

    expect(await findIdsAsJony()).toEqual({
      errors: undefined,
      ids: [SHARED_RECORD_ID],
    });
    expect((await renameAsJony('Not allowed')).body.errors).toBeDefined();
  });

  it('should let an edit grant edit, but never delete or manage access', async () => {
    await setShare({
      principal: JONY,
      accessLevel: RecordShareAccessLevel.FULL,
    });

    expect((await renameAsJony('Edited by Jony')).body.errors).toBeUndefined();

    const deleted = await makeGraphqlApiRequest(
      deleteOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        gqlFields: 'id',
        recordId: SHARED_RECORD_ID,
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(deleted.body.errors).toBeDefined();
    expect(
      (
        await setShare({
          principal: EVERYONE,
          enabled: false,
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        })
      ).body.errors,
    ).toBeDefined();

    const sharing = await makeMetadataApiRequest(
      { query: READ_SHARING, variables: { target: target() } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(sharing.body.data.recordSharing).toMatchObject({
      viewerAccessLevel: RecordShareAccessLevel.FULL,
      permissions: { canRead: true, canUpdate: true, canDelete: false },
      shares: [],
    });
  });

  it('should not let general access reach beyond the role', async () => {
    const share = await setShare({
      principal: EVERYONE,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });

    expect(share.body.errors).toBeUndefined();
    expect(await findIdsAsJony()).toEqual({ errors: undefined, ids: [] });
  });

  it('should let a role grant reach every member of the role', async () => {
    await setShare({ principal: { roleId: memberRoleId } });

    expect((await findIdsAsJony()).ids).toEqual([SHARED_RECORD_ID]);
  });

  it('should tell owners what the role of each recipient grants on its own', async () => {
    await setShare({ principal: JONY });

    const sharing = await makeMetadataApiRequest({
      query: parse(
        `query RecordSharing($target: RecordSharingTargetInput!) { recordSharing(target: $target) { sharingReach shares { principalId canRoleRead canRoleUpdate } } }`,
      ),
      variables: { target: target() },
    });

    expect(sharing.body.data.recordSharing.sharingReach).toBe(
      ObjectSharingReach.WORKSPACE,
    );
    expect(sharing.body.data.recordSharing.shares).toEqual(
      expect.arrayContaining([
        {
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          canRoleRead: false,
          canRoleUpdate: false,
        },
      ]),
    );
  });

  it('should refuse to share with someone the object cannot reach', async () => {
    await setSharingReach(ObjectSharingReach.ROLE_ACCESS);

    const response = await setShare({ principal: JONY });

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      'INVALID_SHARE_WITH',
    );

    await setMemberObjectAccess(true);

    expect((await setShare({ principal: JONY })).body.errors).toBeUndefined();
  });

  it('should stay within the role when the object limits sharing to it', async () => {
    await setShare({ principal: JONY });
    await setSharingReach(ObjectSharingReach.ROLE_ACCESS);

    expect((await findIdsAsJony()).errors).toBeDefined();
  });

  it('should let a named grant reach a record the row filter of the role hides', async () => {
    await setMemberObjectAccess(true);
    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: memberRoleId,
        objectMetadataId,
        predicates: [
          {
            fieldMetadataId: nameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Visible',
          },
        ],
        predicateGroups: [],
      },
    });

    try {
      expect((await findIdsAsJony()).ids).toEqual([OTHER_RECORD_ID]);

      await setShare({
        principal: JONY,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
      });

      expect((await findIdsAsJony()).ids.sort()).toEqual(
        [SHARED_RECORD_ID, OTHER_RECORD_ID].sort(),
      );
      expect(
        (await renameAsJony('Edited under a row filter')).body.errors,
      ).toBeUndefined();

      await setSharingReach(ObjectSharingReach.ROLE_ACCESS);

      expect((await findIdsAsJony()).ids).toEqual([OTHER_RECORD_ID]);
    } finally {
      await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId: memberRoleId,
          objectMetadataId,
          predicates: [],
          predicateGroups: [],
        },
      });
    }
  });

  it('should deliver events of the records named for the member only', async () => {
    const workspaceCacheService =
      getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');
    const resolveAdmittedRecordIds = async () => {
      const { flatObjectMetadataMaps, rolesPermissions } =
        await workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
          'rolesPermissions',
        ]);
      const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(objectMetadata)) {
        throw new Error('Test object metadata is missing');
      }

      return getAppProviderByClassName<RecordAccessPolicyService>(
        'RecordAccessPolicyService',
      )
        .buildEventRecordAccessGate({
          name: `${OBJECT_NAME}.updated`,
          workspaceId,
          objectMetadata,
          events: [SHARED_RECORD_ID, OTHER_RECORD_ID].map((recordId) => ({
            recordId,
            properties: { after: { id: recordId } },
          })) as ObjectRecordEvent[],
        })
        .resolveAdmittedRecordIds({
          isSystemContext: false,
          objectsPermissions: rolesPermissions[memberRoleId],
          principalIds: [
            EVERYONE_PRINCIPAL_ID,
            WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            memberRoleId,
          ],
          isOwningApplication: () => false,
          resolveRowLevelPermissionRecordFilter: () => null,
        });
    };

    expect((await findIdsAsJony()).ids).toEqual([]);
    expect([...(await resolveAdmittedRecordIds())]).toEqual([]);

    await setShare({ principal: JONY });

    expect((await findIdsAsJony()).ids).toEqual([SHARED_RECORD_ID]);
    expect([...(await resolveAdmittedRecordIds())]).toEqual([SHARED_RECORD_ID]);

    await setSharingReach(ObjectSharingReach.ROLE_ACCESS);

    expect([...(await resolveAdmittedRecordIds())]).toEqual([]);
  });

  it('should keep grants within the role while the flag is off', async () => {
    await setShare({ principal: JONY });
    await setRecordSharingEnabled(false);

    try {
      expect((await findIdsAsJony()).errors).toBeDefined();
    } finally {
      await setRecordSharingEnabled(true);
    }
  });

  it('should let admins change the reach of a standard object', async () => {
    const { data } = await makeMetadataApiRequest({
      query: parse(
        `query { objects(paging: { first: 1000 }) { edges { node { id nameSingular sharingReach } } } }`,
      ),
    }).then((response) => response.body);
    const company = data.objects.edges
      .map(({ node }: { node: { nameSingular: string } }) => node)
      .find(
        ({ nameSingular }: { nameSingular: string }) =>
          nameSingular === 'company',
      );

    expect(company.sharingReach).toBe(ObjectSharingReach.WORKSPACE);

    try {
      const { data: updated } = await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: company.id,
          updatePayload: { sharingReach: ObjectSharingReach.ROLE_ACCESS },
        },
        gqlFields: 'sharingReach',
      });

      expect(updated.updateOneObject.sharingReach).toBe(
        ObjectSharingReach.ROLE_ACCESS,
      );
    } finally {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: company.id,
          updatePayload: { sharingReach: ObjectSharingReach.WORKSPACE },
        },
      });
    }
  });
});
