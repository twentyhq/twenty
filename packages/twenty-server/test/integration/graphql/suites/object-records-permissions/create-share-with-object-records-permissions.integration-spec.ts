/* @license Enterprise */

import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_SINGULAR = 'shareWithTestObject';
const OBJECT_PLURAL = 'shareWithTestObjects';
const SHARE_WITH_SINGLE_TARGET_MESSAGE =
  'Each shareWith entry must target exactly one of workspaceMemberId, roleId or everyone';

const createOneOperation = ({
  data,
  shareWith,
}: {
  data: { id: string; name: string };
  shareWith?: ShareWithInput[] | null;
}) => ({
  query: gql`
    mutation CreateOneShareWithTestObject(
      $data: ShareWithTestObjectCreateInput!
      $shareWith: [ShareWithInput!]
    ) {
      createShareWithTestObject(data: $data, shareWith: $shareWith) {
        id
      }
    }
  `,
  variables: { data, shareWith },
});

const findManyOperation = (recordId: string) =>
  findManyOperationFactory({
    objectMetadataSingularName: OBJECT_SINGULAR,
    objectMetadataPluralName: OBJECT_PLURAL,
    gqlFields: 'id',
    filter: { id: { eq: recordId } },
  });

const ownerRowFor = (recordId: string, workspaceMemberId: string) => ({
  recordId,
  principalId: workspaceMemberId,
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.FULL,
  rowCause: RecordShareRowCause.OWNER,
  sourceId: recordId,
});

describe('createShareWithObjectRecordsPermissions', () => {
  let recordShareStorageService: RecordShareStorageService;
  let objectMetadataId: string;
  let memberRoleId: string;

  const createdRecordIds: string[] = [];

  const findRecordShares = (recordId: string) =>
    recordShareStorageService.findByRecordIds({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
      recordIds: [recordId],
    });

  const trackRecordId = (): string => {
    const recordId = randomUUID();

    createdRecordIds.push(recordId);

    return recordId;
  };

  beforeAll(async () => {
    recordShareStorageService =
      getAppProviderByClassName<RecordShareStorageService>(
        'RecordShareStorageService',
      );

    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_SINGULAR,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Share With Test Object',
        labelPlural: 'Share With Test Objects',
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

    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
  });

  afterAll(async () => {
    const recordShareIds = (
      await Promise.all(createdRecordIds.map(findRecordShares))
    )
      .flat()
      .map((recordShare) => recordShare.id);

    await deleteRecordsByIds('recordShare', recordShareIds);
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: objectMetadataId },
    });
  });

  describe('without record-level sharing', () => {
    it('should ignore shareWith and write no row', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlApiRequest(
        createOneOperation({
          data: { id: recordId, name: 'open object' },
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(await findRecordShares(recordId)).toEqual([]);
    });
  });

  describe('with record-level sharing', () => {
    const setRecordSharingEnabled = (value: boolean) =>
      updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
        value,
        expectToFail: false,
      });

    beforeAll(async () => {
      await setRecordSharingEnabled(true);
    });

    afterAll(async () => {
      await setRecordSharingEnabled(false);
    });

    it('should write the named grants without an owner row when everyone keeps the default access', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlApiRequest(
        createOneOperation({
          data: { id: recordId, name: 'open by default' },
          shareWith: [
            {
              workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              accessLevel: RecordShareAccessLevel.READ_WRITE,
            },
            { everyone: true, accessLevel: RecordShareAccessLevel.READ_WRITE },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining({
          recordId,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        }),
      ]);
    });

    it('should restrict general access on creation and keep the creator in charge', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlApiRequest(
        createOneOperation({
          data: { id: recordId, name: 'restricted on creation' },
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();

      const recordShares = await findRecordShares(recordId);

      expect(recordShares).toHaveLength(2);
      expect(recordShares).toEqual(
        expect.arrayContaining([
          expect.objectContaining(
            ownerRowFor(recordId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE),
          ),
          expect.objectContaining({
            recordId,
            principalId: EVERYONE_PRINCIPAL_ID,
            principalType: RecordSharePrincipalType.EVERYONE,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.MANUAL,
          }),
        ]),
      );

      const renamedByJony = await makeGraphqlApiRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: 'id',
          recordId,
          data: { name: 'renamed by jony' },
        }),
      );

      expect(renamedByJony.body.errors).toBeDefined();
    });

    it('should create a record restricted to its creator', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlApiRequest(
        createOneOperation({
          data: { id: recordId, name: 'restricted to the creator' },
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.NONE },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(await findRecordShares(recordId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining(
            ownerRowFor(recordId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE),
          ),
          expect.objectContaining({
            principalId: EVERYONE_PRINCIPAL_ID,
            accessLevel: RecordShareAccessLevel.NONE,
            rowCause: RecordShareRowCause.MANUAL,
          }),
        ]),
      );

      const jonyRead = await makeGraphqlApiRequestWithMemberRole(
        findManyOperation(recordId),
      );
      const creatorRead = await makeGraphqlApiRequest(
        findManyOperation(recordId),
      );

      expect(jonyRead.body.data[OBJECT_PLURAL].edges).toEqual([]);
      expect(
        creatorRead.body.data[OBJECT_PLURAL].edges.map(
          (edge: { node: { id: string } }) => edge.node.id,
        ),
      ).toEqual([recordId]);
    });

    it('should refuse full access for everyone', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlApiRequest(
        createOneOperation({
          data: { id: recordId, name: 'full access for everyone' },
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.FULL },
          ],
        }),
      );

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
      expect(await findRecordShares(recordId)).toEqual([]);
    });

    it('should refuse a shareWith naming the same principal twice', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlApiRequest(
        createOneOperation({
          data: { id: recordId, name: 'duplicate principal' },
          shareWith: [
            { roleId: memberRoleId, accessLevel: RecordShareAccessLevel.READ },
            { roleId: memberRoleId, accessLevel: RecordShareAccessLevel.FULL },
          ],
        }),
      );

      expect(JSON.stringify(response.body.errors)).toContain(
        'shareWith names the same principal more than once',
      );
      expect(await findRecordShares(recordId)).toEqual([]);
    });

    it('should reject an entry targeting two principals', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlApiRequest(
        createOneOperation({
          data: { id: recordId, name: 'two targets' },
          shareWith: [
            {
              workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              roleId: memberRoleId,
              accessLevel: RecordShareAccessLevel.READ,
            },
          ],
        }),
      );

      expect(response.body.data).toStrictEqual({
        createShareWithTestObject: null,
      });
      expect(response.body.errors[0].message).toBe(
        SHARE_WITH_SINGLE_TARGET_MESSAGE,
      );
      expect(await findRecordShares(recordId)).toEqual([]);
    });
  });
});
