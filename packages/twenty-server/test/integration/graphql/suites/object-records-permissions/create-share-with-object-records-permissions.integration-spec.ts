import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { setObjectReadability } from 'test/integration/metadata/suites/object-metadata/utils/set-object-readability.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  FieldMetadataType,
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type ShareWithInput } from 'src/engine/api/common/types/share-with-input.type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_SINGULAR = 'shareWithTestObject';
const OBJECT_PLURAL = 'shareWithTestObjects';
const SHARE_WITH_REQUIRED_MESSAGE =
  'Creating a record of a private object requires the shareWith argument';
const SHARE_WITH_SINGLE_TARGET_MESSAGE =
  'Each shareWith entry must target exactly one of workspaceMemberId, roleId or everyone';

const createOneOperation = ({
  data,
  shareWith,
}: {
  data: { id: string; name: string };
  shareWith?: ShareWithInput[];
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

const createManyOperation = ({
  data,
  shareWith,
}: {
  data: { id: string; name: string }[];
  shareWith?: ShareWithInput[];
}) => ({
  query: gql`
    mutation CreateManyShareWithTestObjects(
      $data: [ShareWithTestObjectCreateInput!]!
      $shareWith: [ShareWithInput!]
    ) {
      createShareWithTestObjects(data: $data, shareWith: $shareWith) {
        id
      }
    }
  `,
  variables: { data, shareWith },
});

const createOnePersonWithNestedRecordOperation = ({
  personId,
  nestedRecord,
  shareWith,
}: {
  personId: string;
  nestedRecord: { id: string; name: string };
  shareWith?: ShareWithInput[];
}) => ({
  query: gql`
    mutation CreateOnePersonWithNestedShareWithTestObject(
      $data: PersonCreateInput!
      $shareWith: [ShareWithInput!]
    ) {
      createPerson(data: $data, shareWith: $shareWith) {
        id
        shareWithTestObject {
          id
        }
      }
    }
  `,
  variables: {
    data: {
      id: personId,
      [OBJECT_SINGULAR]: { create: nestedRecord },
    },
    shareWith,
  },
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

const apiKeyRoleRowFor = (recordId: string, roleId: string) => ({
  recordId,
  principalId: roleId,
  principalType: RecordSharePrincipalType.ROLE,
  accessLevel: RecordShareAccessLevel.FULL,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: recordId,
});

const setRecordSharingEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
    value,
    expectToFail: false,
  });

describe('createShareWithObjectRecordsPermissions', () => {
  let recordShareService: RecordShareService;
  let objectMetadataId: string;
  let personRelationFieldMetadataId: string;
  let memberRoleId: string;
  let adminRoleId: string;

  const createdRecordIds: string[] = [];
  const createdPersonIds: string[] = [];

  const findRecordShares = (recordId: string) =>
    recordShareService.findByRecord({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
      recordId,
    });

  const trackRecordId = (): string => {
    const recordId = randomUUID();

    createdRecordIds.push(recordId);

    return recordId;
  };

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');

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

    const personObjectMetadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'person' },
    });

    const { data: personRelationFieldData } = await createOneFieldMetadata({
      input: {
        name: OBJECT_SINGULAR,
        label: 'Share With Test Object',
        type: FieldMetadataType.RELATION,
        objectMetadataId: personObjectMetadata.id,
        isLabelSyncedWithName: false,
        relationCreationPayload: {
          targetObjectMetadataId: objectMetadataId,
          targetFieldLabel: 'People',
          targetFieldIcon: 'IconUser',
          type: RelationType.MANY_TO_ONE,
        },
      },
    });

    personRelationFieldMetadataId = personRelationFieldData.createOneField.id;

    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);

    const recordShareIds = (
      await Promise.all(createdRecordIds.map(findRecordShares))
    )
      .flat()
      .map((recordShare) => recordShare.id);

    await deleteRecordsByIds('recordShare', recordShareIds);
    await setObjectReadability(objectMetadataId, MetadataReadability.OPEN);
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: createdPersonIds } },
      }),
    );
    await deleteOneFieldMetadata({
      input: { idToDelete: personRelationFieldMetadataId },
      expectToFail: false,
    });
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

  describe('PRIVATE readability with record sharing enabled', () => {
    beforeAll(async () => {
      await setObjectReadability(objectMetadataId, MetadataReadability.PRIVATE);
      await setRecordSharingEnabled(true);
    });

    it('should give the creating member a FULL owner row when no shareWith is passed', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlAPIRequest(
        createOneOperation({ data: { id: recordId, name: 'owner only' } }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createShareWithTestObject.id).toBe(recordId);

      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining(
          ownerRowFor(recordId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE),
        ),
      ]);
    });

    it('should add a MANUAL role row next to the owner row', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlAPIRequest(
        createOneOperation({
          data: { id: recordId, name: 'shared with member role' },
          shareWith: [
            { roleId: memberRoleId, accessLevel: RecordShareAccessLevel.READ },
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
            recordId,
            principalId: memberRoleId,
            principalType: RecordSharePrincipalType.ROLE,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          }),
        ]),
      );
      expect(await findRecordShares(recordId)).toHaveLength(2);
    });

    it('should reject an api key create without shareWith', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlAPIRequestWithApiKey(
        createOneOperation({ data: { id: recordId, name: 'api key' } }),
      );

      expect(response.body.data).toStrictEqual({
        createShareWithTestObject: null,
      });
      expect(response.body.errors[0].message).toBe(SHARE_WITH_REQUIRED_MESSAGE);
      expect(await findRecordShares(recordId)).toEqual([]);
    });

    it('should write an EVERYONE row next to the api key role row for an api key create sharing with everyone', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlAPIRequestWithApiKey(
        createOneOperation({
          data: { id: recordId, name: 'api key shared with everyone' },
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createShareWithTestObject.id).toBe(recordId);

      expect(await findRecordShares(recordId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining(apiKeyRoleRowFor(recordId, adminRoleId)),
          expect.objectContaining({
            recordId,
            principalId: EVERYONE_PRINCIPAL_ID,
            principalType: RecordSharePrincipalType.EVERYONE,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId: recordId,
          }),
        ]),
      );
      expect(await findRecordShares(recordId)).toHaveLength(2);
    });

    it('should skip the api key role row when shareWith already names that role', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlAPIRequestWithApiKey(
        createOneOperation({
          data: { id: recordId, name: 'api key shared with its own role' },
          shareWith: [
            { roleId: adminRoleId, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();

      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining({
          recordId,
          principalId: adminRoleId,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId: recordId,
        }),
      ]);
    });

    it('should let an api key that shared a record with a member only read and update it', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlAPIRequestWithApiKey(
        createOneOperation({
          data: { id: recordId, name: 'api key shared with jony only' },
          shareWith: [
            {
              workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              accessLevel: RecordShareAccessLevel.FULL,
            },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createShareWithTestObject.id).toBe(recordId);

      expect(await findRecordShares(recordId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining(apiKeyRoleRowFor(recordId, adminRoleId)),
          expect.objectContaining({
            recordId,
            principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.FULL,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId: recordId,
          }),
        ]),
      );
      expect(await findRecordShares(recordId)).toHaveLength(2);

      const apiKeyReadResponse = await makeGraphqlAPIRequestWithApiKey(
        findManyOperation(recordId),
      );

      expect(apiKeyReadResponse.body.errors).toBeUndefined();
      expect(
        apiKeyReadResponse.body.data[OBJECT_PLURAL].edges.map(
          (edge: { node: { id: string } }) => edge.node.id,
        ),
      ).toEqual([recordId]);

      const apiKeyUpdateResponse = await makeGraphqlAPIRequestWithApiKey(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: 'id name',
          recordId,
          data: { name: 'renamed by api key' },
        }),
      );

      expect(apiKeyUpdateResponse.body.errors).toBeUndefined();
      expect(apiKeyUpdateResponse.body.data.updateShareWithTestObject).toEqual({
        id: recordId,
        name: 'renamed by api key',
      });

      const jonyReadResponse = await makeGraphqlAPIRequestWithMemberRole(
        findManyOperation(recordId),
      );

      expect(jonyReadResponse.body.errors).toBeUndefined();
      expect(
        jonyReadResponse.body.data[OBJECT_PLURAL].edges.map(
          (edge: { node: { id: string } }) => edge.node.id,
        ),
      ).toEqual([recordId]);
    });

    it('should give the creating member the owner row on a nested create', async () => {
      const personId = randomUUID();
      const nestedRecordId = trackRecordId();

      createdPersonIds.push(personId);

      const response = await makeGraphqlAPIRequest(
        createOnePersonWithNestedRecordOperation({
          personId,
          nestedRecord: { id: nestedRecordId, name: 'nested by member' },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createPerson[OBJECT_SINGULAR].id).toBe(
        nestedRecordId,
      );

      expect(await findRecordShares(nestedRecordId)).toEqual([
        expect.objectContaining(
          ownerRowFor(nestedRecordId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE),
        ),
      ]);
    });

    it('should forward shareWith to a nested create by an api key', async () => {
      const personId = randomUUID();
      const nestedRecordId = trackRecordId();

      createdPersonIds.push(personId);

      const response = await makeGraphqlAPIRequestWithApiKey(
        createOnePersonWithNestedRecordOperation({
          personId,
          nestedRecord: { id: nestedRecordId, name: 'nested by api key' },
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createPerson[OBJECT_SINGULAR].id).toBe(
        nestedRecordId,
      );

      expect(await findRecordShares(nestedRecordId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining(
            apiKeyRoleRowFor(nestedRecordId, adminRoleId),
          ),
          expect.objectContaining({
            recordId: nestedRecordId,
            principalId: EVERYONE_PRINCIPAL_ID,
            principalType: RecordSharePrincipalType.EVERYONE,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId: nestedRecordId,
          }),
        ]),
      );
      expect(await findRecordShares(nestedRecordId)).toHaveLength(2);
    });

    it('should write the owner row and the shared row for every record of a createMany', async () => {
      const recordIds = [trackRecordId(), trackRecordId(), trackRecordId()];

      const response = await makeGraphqlAPIRequest(
        createManyOperation({
          data: recordIds.map((id, index) => ({ id, name: `batch ${index}` })),
          shareWith: [
            {
              workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              accessLevel: RecordShareAccessLevel.READ_WRITE,
            },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createShareWithTestObjects).toHaveLength(3);

      for (const recordId of recordIds) {
        expect(await findRecordShares(recordId)).toEqual(
          expect.arrayContaining([
            expect.objectContaining(
              ownerRowFor(recordId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE),
            ),
            expect.objectContaining({
              recordId,
              principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
              accessLevel: RecordShareAccessLevel.READ_WRITE,
              rowCause: RecordShareRowCause.MANUAL,
              sourceId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
            }),
          ]),
        );
        expect(await findRecordShares(recordId)).toHaveLength(2);
      }
    });

    it('should reject an entry targeting two principals', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlAPIRequest(
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

  describe('PRIVATE readability with record sharing disabled', () => {
    beforeAll(async () => {
      await setObjectReadability(objectMetadataId, MetadataReadability.PRIVATE);
      await setRecordSharingEnabled(false);
    });

    it('should accept an api key create without shareWith and grant everyone FULL access', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlAPIRequestWithApiKey(
        createOneOperation({
          data: { id: recordId, name: 'api key without shareWith' },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createShareWithTestObject.id).toBe(recordId);

      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining({
          recordId,
          principalId: EVERYONE_PRINCIPAL_ID,
          principalType: RecordSharePrincipalType.EVERYONE,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.APPLICATION,
          sourceId: objectMetadataId,
        }),
      ]);
    });

    it('should still give the creating member the owner row only', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlAPIRequest(
        createOneOperation({
          data: { id: recordId, name: 'member with flag off' },
        }),
      );

      expect(response.body.errors).toBeUndefined();

      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining(
          ownerRowFor(recordId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE),
        ),
      ]);
    });
  });

  describe('OPEN readability', () => {
    beforeAll(async () => {
      await setObjectReadability(objectMetadataId, MetadataReadability.OPEN);
    });

    it('should ignore shareWith and write no row', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlAPIRequest(
        createOneOperation({
          data: { id: recordId, name: 'open object' },
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.FULL },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(await findRecordShares(recordId)).toEqual([]);
    });
  });
});
