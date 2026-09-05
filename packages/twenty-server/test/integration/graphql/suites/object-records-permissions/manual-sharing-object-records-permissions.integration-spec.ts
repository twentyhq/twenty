import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { setObjectReadability } from 'test/integration/metadata/suites/object-metadata/utils/set-object-readability.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  FeatureFlagKey,
  FieldMetadataType,
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  RelationType,
} from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_SINGULAR = 'ownedTestObject';
const OBJECT_PLURAL = 'ownedTestObjects';
const RECORD_SHARES_FIELDS =
  'shares { id principalId principalType accessLevel rowCause sourceId } viewerAccessLevel';

const JANE = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;
const JONY = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY;

const recordSharesOperation = ({
  objectMetadataId,
  recordId,
}: {
  objectMetadataId: string;
  recordId: string;
}) => ({
  query: gql`
    query RecordShares($objectMetadataId: UUID!, $recordId: UUID!) {
      recordShares(objectMetadataId: $objectMetadataId, recordId: $recordId) {
        ${RECORD_SHARES_FIELDS}
      }
    }
  `,
  variables: { objectMetadataId, recordId },
});

const shareRecordOperation = ({
  objectMetadataId,
  recordId,
  shareWith,
}: {
  objectMetadataId: string;
  recordId: string;
  shareWith: {
    workspaceMemberId?: string;
    roleId?: string;
    everyone?: boolean;
    accessLevel: RecordShareAccessLevel;
  }[];
}) => ({
  query: gql`
    mutation ShareRecord(
      $objectMetadataId: UUID!
      $recordId: UUID!
      $shareWith: [ShareWithInput!]!
    ) {
      shareRecord(
        objectMetadataId: $objectMetadataId
        recordId: $recordId
        shareWith: $shareWith
      ) {
        ${RECORD_SHARES_FIELDS}
      }
    }
  `,
  variables: { objectMetadataId, recordId, shareWith },
});

const unshareRecordOperation = ({
  objectMetadataId,
  recordId,
  principalId,
}: {
  objectMetadataId: string;
  recordId: string;
  principalId: string;
}) => ({
  query: gql`
    mutation UnshareRecord(
      $objectMetadataId: UUID!
      $recordId: UUID!
      $principalId: UUID!
    ) {
      unshareRecord(
        objectMetadataId: $objectMetadataId
        recordId: $recordId
        principalId: $principalId
      ) {
        ${RECORD_SHARES_FIELDS}
      }
    }
  `,
  variables: { objectMetadataId, recordId, principalId },
});

const transferRecordOwnershipOperation = ({
  objectMetadataId,
  recordId,
  workspaceMemberId,
}: {
  objectMetadataId: string;
  recordId: string;
  workspaceMemberId: string;
}) => ({
  query: gql`
    mutation TransferRecordOwnership(
      $objectMetadataId: UUID!
      $recordId: UUID!
      $workspaceMemberId: UUID!
    ) {
      transferRecordOwnership(
        objectMetadataId: $objectMetadataId
        recordId: $recordId
        workspaceMemberId: $workspaceMemberId
      ) {
        ${RECORD_SHARES_FIELDS}
      }
    }
  `,
  variables: { objectMetadataId, recordId, workspaceMemberId },
});

const findManyOperation = (recordId: string) =>
  findManyOperationFactory({
    objectMetadataSingularName: OBJECT_SINGULAR,
    objectMetadataPluralName: OBJECT_PLURAL,
    gqlFields: 'id',
    filter: { id: { eq: recordId } },
  });

const updateNameOperation = (recordId: string, name: string) =>
  updateOneOperationFactory({
    objectMetadataSingularName: OBJECT_SINGULAR,
    gqlFields: 'id name',
    recordId,
    data: { name },
  });

const readRecordIds = (response: {
  body: { data: Record<string, { edges: { node: { id: string } }[] }> };
}) => response.body.data[OBJECT_PLURAL].edges.map((edge) => edge.node.id);

const ownerShareFor = (recordId: string, workspaceMemberId: string) => ({
  principalId: workspaceMemberId,
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.FULL,
  rowCause: RecordShareRowCause.OWNER,
  sourceId: recordId,
});

const ownerRowFor = (recordId: string, workspaceMemberId: string) => ({
  recordId,
  ...ownerShareFor(recordId, workspaceMemberId),
});

const setRecordSharingEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
    value,
    expectToFail: false,
  });

describe('manualSharingObjectRecordsPermissions', () => {
  let recordShareService: RecordShareService;
  let objectMetadataId: string;
  let ownerFieldMetadataId: string;
  let nameFieldMetadataId: string;

  const createdRecordIds: string[] = [];

  const findRecordShares = (recordId: string) =>
    recordShareService.findByRecord({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
      recordId,
    });

  const createRecordAsJonyOwnedByJane = async (): Promise<string> => {
    const recordId = randomUUID();

    createdRecordIds.push(recordId);

    const response = await makeGraphqlAPIRequestWithMemberRole(
      createOneOperationFactory({
        objectMetadataSingularName: OBJECT_SINGULAR,
        gqlFields: 'id',
        data: { id: recordId, name: 'owned by jane', ownerId: JANE },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return recordId;
  };

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');

    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_SINGULAR,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Owned Test Object',
        labelPlural: 'Owned Test Objects',
        icon: 'IconLock',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = data.createOneObject.id;

    nameFieldMetadataId = (
      await getCoreRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      ).findOneOrFail({ where: { objectMetadataId, name: 'name' } })
    ).id;

    const workspaceMemberObjectMetadata =
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          nameSingular: 'workspaceMember',
        },
      });

    const { data: ownerFieldData } = await createOneFieldMetadata({
      input: {
        name: 'owner',
        label: 'Owner',
        type: FieldMetadataType.RELATION,
        objectMetadataId,
        isLabelSyncedWithName: false,
        relationCreationPayload: {
          targetObjectMetadataId: workspaceMemberObjectMetadata.id,
          targetFieldLabel: 'Owned Test Objects',
          targetFieldIcon: 'IconLock',
          type: RelationType.MANY_TO_ONE,
        },
      },
    });

    ownerFieldMetadataId = ownerFieldData.createOneField.id;
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
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { ownerFieldMetadataId: null },
      },
    });
    await deleteOneFieldMetadata({
      input: { idToDelete: ownerFieldMetadataId },
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

  describe('owner field on object metadata', () => {
    it('should reject a text field as owner field', async () => {
      const { errors } = await updateOneObjectMetadata({
        expectToFail: true,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { ownerFieldMetadataId: nameFieldMetadataId },
        },
      });

      expect(errors[0].extensions.errors.objectMetadata[0].errors).toEqual([
        expect.objectContaining({
          message:
            'ownerFieldMetadataUniversalIdentifier validation failed: field is not a MANY_TO_ONE relation',
        }),
      ]);
    });

    it('should accept a many-to-one relation to workspaceMember as owner field', async () => {
      const { data, errors } = await updateOneObjectMetadata({
        expectToFail: false,
        gqlFields: 'id ownerFieldMetadataId',
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { ownerFieldMetadataId },
        },
      });

      expect(errors).toBeUndefined();
      expect(data.updateOneObject.ownerFieldMetadataId).toBe(
        ownerFieldMetadataId,
      );
    });
  });

  describe('PRIVATE readability with record sharing enabled', () => {
    beforeAll(async () => {
      await setObjectReadability(objectMetadataId, MetadataReadability.PRIVATE);
      await setRecordSharingEnabled(true);
    });

    it('should give the owner field value the OWNER row instead of the creator', async () => {
      const recordId = await createRecordAsJonyOwnedByJane();

      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining(ownerRowFor(recordId, JANE)),
      ]);

      expect(
        readRecordIds(await makeGraphqlAPIRequest(findManyOperation(recordId))),
      ).toEqual([recordId]);
      expect(
        readRecordIds(
          await makeGraphqlAPIRequestWithMemberRole(
            findManyOperation(recordId),
          ),
        ),
      ).toEqual([]);
    });

    it('should let the owner share at READ, then at READ_WRITE, and unshare', async () => {
      const recordId = await createRecordAsJonyOwnedByJane();

      const readShareResponse = await makeMetadataAPIRequest(
        shareRecordOperation({
          objectMetadataId,
          recordId,
          shareWith: [
            {
              workspaceMemberId: JONY,
              accessLevel: RecordShareAccessLevel.READ,
            },
          ],
        }),
      );

      expect(readShareResponse.body.errors).toBeUndefined();
      expect(readShareResponse.body.data.shareRecord).toEqual({
        shares: expect.arrayContaining([
          expect.objectContaining({
            principalId: JONY,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId: JANE,
          }),
        ]),
        viewerAccessLevel: RecordShareAccessLevel.FULL,
      });

      expect(
        readRecordIds(
          await makeGraphqlAPIRequestWithMemberRole(
            findManyOperation(recordId),
          ),
        ),
      ).toEqual([recordId]);

      const deniedUpdateResponse = await makeGraphqlAPIRequestWithMemberRole(
        updateNameOperation(recordId, 'renamed by a reader'),
      );

      expect(deniedUpdateResponse.body.errors[0].message).toBe(
        'Record not found',
      );

      const readWriteShareResponse = await makeMetadataAPIRequest(
        shareRecordOperation({
          objectMetadataId,
          recordId,
          shareWith: [
            {
              workspaceMemberId: JONY,
              accessLevel: RecordShareAccessLevel.READ_WRITE,
            },
          ],
        }),
      );

      expect(readWriteShareResponse.body.errors).toBeUndefined();
      expect(
        readWriteShareResponse.body.data.shareRecord.shares.filter(
          (share: { principalId: string }) => share.principalId === JONY,
        ),
      ).toEqual([
        expect.objectContaining({
          accessLevel: RecordShareAccessLevel.READ_WRITE,
        }),
      ]);

      const allowedUpdateResponse = await makeGraphqlAPIRequestWithMemberRole(
        updateNameOperation(recordId, 'renamed by a writer'),
      );

      expect(allowedUpdateResponse.body.errors).toBeUndefined();
      expect(allowedUpdateResponse.body.data.updateOwnedTestObject).toEqual({
        id: recordId,
        name: 'renamed by a writer',
      });

      const unshareResponse = await makeMetadataAPIRequest(
        unshareRecordOperation({
          objectMetadataId,
          recordId,
          principalId: JONY,
        }),
      );

      expect(unshareResponse.body.errors).toBeUndefined();
      expect(unshareResponse.body.data.unshareRecord.shares).toEqual([
        expect.objectContaining(ownerShareFor(recordId, JANE)),
      ]);
      expect(
        readRecordIds(
          await makeGraphqlAPIRequestWithMemberRole(
            findManyOperation(recordId),
          ),
        ),
      ).toEqual([]);
    });

    it('should refuse shareRecord from a READ holder and recordShares from a stranger', async () => {
      const recordId = await createRecordAsJonyOwnedByJane();

      const strangerResponse = await makeMetadataAPIRequestWithMemberRole(
        recordSharesOperation({ objectMetadataId, recordId }),
      );

      expect(strangerResponse.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );

      await makeMetadataAPIRequest(
        shareRecordOperation({
          objectMetadataId,
          recordId,
          shareWith: [
            {
              workspaceMemberId: JONY,
              accessLevel: RecordShareAccessLevel.READ,
            },
          ],
        }),
      );

      const readerListResponse = await makeMetadataAPIRequestWithMemberRole(
        recordSharesOperation({ objectMetadataId, recordId }),
      );

      expect(readerListResponse.body.errors).toBeUndefined();
      expect(readerListResponse.body.data.recordShares).toEqual({
        shares: expect.arrayContaining([
          expect.objectContaining(ownerShareFor(recordId, JANE)),
          expect.objectContaining({
            principalId: JONY,
            accessLevel: RecordShareAccessLevel.READ,
          }),
        ]),
        viewerAccessLevel: RecordShareAccessLevel.READ,
      });

      const readerShareResponse = await makeMetadataAPIRequestWithMemberRole(
        shareRecordOperation({
          objectMetadataId,
          recordId,
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.FULL },
          ],
        }),
      );

      expect(readerShareResponse.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(await findRecordShares(recordId)).toHaveLength(2);
    });

    it('should move the OWNER row on transferRecordOwnership and on an owner column update', async () => {
      const recordId = await createRecordAsJonyOwnedByJane();

      const transferResponse = await makeMetadataAPIRequest(
        transferRecordOwnershipOperation({
          objectMetadataId,
          recordId,
          workspaceMemberId: JONY,
        }),
      );

      expect(transferResponse.body.errors).toBeUndefined();
      expect(transferResponse.body.data.transferRecordOwnership).toEqual({
        shares: [expect.objectContaining(ownerShareFor(recordId, JONY))],
        viewerAccessLevel: null,
      });
      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining(ownerRowFor(recordId, JONY)),
      ]);
      expect(
        readRecordIds(await makeGraphqlAPIRequest(findManyOperation(recordId))),
      ).toEqual([]);

      const updateOwnerResponse = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: 'id ownerId',
          recordId,
          data: { ownerId: JANE },
        }),
      );

      expect(updateOwnerResponse.body.errors).toBeUndefined();
      expect(updateOwnerResponse.body.data.updateOwnedTestObject).toEqual({
        id: recordId,
        ownerId: JANE,
      });
      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining(ownerRowFor(recordId, JANE)),
      ]);
      expect(
        readRecordIds(
          await makeGraphqlAPIRequestWithMemberRole(
            findManyOperation(recordId),
          ),
        ),
      ).toEqual([]);
    });
  });

  describe('PRIVATE readability with record sharing enabled, edge cases', () => {
    const shareWithJony = (
      recordId: string,
      accessLevel: RecordShareAccessLevel,
    ) =>
      makeMetadataAPIRequest(
        shareRecordOperation({
          objectMetadataId,
          recordId,
          shareWith: [{ workspaceMemberId: JONY, accessLevel }],
        }),
      );

    it('should keep the OWNER row when unshareRecord targets the owner', async () => {
      const recordId = await createRecordAsJonyOwnedByJane();

      const response = await makeMetadataAPIRequest(
        unshareRecordOperation({
          objectMetadataId,
          recordId,
          principalId: JANE,
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.unshareRecord).toEqual({
        shares: [expect.objectContaining(ownerShareFor(recordId, JANE))],
        viewerAccessLevel: RecordShareAccessLevel.FULL,
      });
    });

    it('should refuse transferRecordOwnership from a READ holder', async () => {
      const recordId = await createRecordAsJonyOwnedByJane();

      await shareWithJony(recordId, RecordShareAccessLevel.READ);

      const response = await makeMetadataAPIRequestWithMemberRole(
        transferRecordOwnershipOperation({
          objectMetadataId,
          recordId,
          workspaceMemberId: JONY,
        }),
      );

      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(await findRecordShares(recordId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining(ownerRowFor(recordId, JANE)),
        ]),
      );
    });

    it('should refuse transferRecordOwnership from a FULL holder whose role cannot update the object', async () => {
      const recordId = await createRecordAsJonyOwnedByJane();

      const shareResponse = await makeMetadataAPIRequest(
        shareRecordOperation({
          objectMetadataId,
          recordId,
          shareWith: [
            {
              workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
              accessLevel: RecordShareAccessLevel.FULL,
            },
          ],
        }),
      );

      expect(shareResponse.body.errors).toBeUndefined();

      const response = await makeMetadataAPIRequest(
        transferRecordOwnershipOperation({
          objectMetadataId,
          recordId,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
        }),
        APPLE_PHIL_GUEST_ACCESS_TOKEN,
      );

      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(await findRecordShares(recordId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining(ownerRowFor(recordId, JANE)),
        ]),
      );
    });

    it('should move the OWNER row on a connect-form owner update and keep it on disconnect', async () => {
      const recordId = await createRecordAsJonyOwnedByJane();

      const connectResponse = await makeGraphqlAPIRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: 'id ownerId',
          recordId,
          data: { owner: { connect: { where: { id: JONY } } } },
        }),
      );

      expect(connectResponse.body.errors).toBeUndefined();
      expect(connectResponse.body.data.updateOwnedTestObject).toEqual({
        id: recordId,
        ownerId: JONY,
      });
      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining(ownerRowFor(recordId, JONY)),
      ]);

      const disconnectResponse = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: 'id ownerId',
          recordId,
          data: { owner: { disconnect: true } },
        }),
      );

      expect(disconnectResponse.body.errors).toBeUndefined();
      expect(disconnectResponse.body.data.updateOwnedTestObject).toEqual({
        id: recordId,
        ownerId: null,
      });
      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining(ownerRowFor(recordId, JONY)),
      ]);
    });

    it('should not let a READ_WRITE holder take ownership', async () => {
      const recordId = await createRecordAsJonyOwnedByJane();

      await shareWithJony(recordId, RecordShareAccessLevel.READ_WRITE);

      const response = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: 'id ownerId',
          recordId,
          data: { ownerId: JONY },
        }),
      );

      expect(response.body.errors[0].message).toBe('Record not found');
      expect(await findRecordShares(recordId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining(ownerRowFor(recordId, JANE)),
        ]),
      );
      expect(
        (await findRecordShares(recordId)).filter(
          (recordShare) => recordShare.rowCause === RecordShareRowCause.OWNER,
        ),
      ).toHaveLength(1);
    });
  });

  describe('PRIVATE readability with record sharing disabled', () => {
    beforeAll(async () => {
      await setRecordSharingEnabled(false);
    });

    it('should refuse the sharing mutations', async () => {
      const recordId = await createRecordAsJonyOwnedByJane();

      const response = await makeMetadataAPIRequest(
        shareRecordOperation({
          objectMetadataId,
          recordId,
          shareWith: [
            {
              workspaceMemberId: JONY,
              accessLevel: RecordShareAccessLevel.READ,
            },
          ],
        }),
      );

      expect(response.body.errors[0].message).toBe(
        'Feature flag "IS_RECORD_SHARING_ENABLED" is not enabled for this workspace',
      );
      expect(response.body.data).toBeNull();
      expect(await findRecordShares(recordId)).toEqual([
        expect.objectContaining(ownerRowFor(recordId, JANE)),
      ]);
    });
  });
});
