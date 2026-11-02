/* @license Enterprise */

import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type ShareWithInput } from 'src/engine/permissions/record-share/types/share-with-input.type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_SINGULAR = 'shareWithTestObject';
const OBJECT_PLURAL = 'shareWithTestObjects';
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

describe('createShareWithObjectRecordsPermissions', () => {
  let recordShareStorageService: RecordShareStorageService;
  let objectMetadataId: string;
  let personRelationFieldMetadataId: string;

  const createdRecordIds: string[] = [];
  const createdPersonIds: string[] = [];

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
  });

  afterAll(async () => {
    const recordShareIds = (
      await Promise.all(createdRecordIds.map(findRecordShares))
    )
      .flat()
      .map((recordShare) => recordShare.id);

    await deleteRecordsByIds('recordShare', recordShareIds);
    await makeGraphqlApiRequest(
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

    it('should refuse a view-only general access on creation, which private records replace', async () => {
      const recordId = trackRecordId();

      const response = await makeGraphqlApiRequest(
        createOneOperation({
          data: { id: recordId, name: 'view only on creation' },
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
      );

      expect(response.body.errors).toBeDefined();
      expect(await findRecordShares(recordId)).toEqual([]);
    });

    it('should create a private record only its creator reads', async () => {
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
      expect(await findRecordShares(recordId)).toEqual([]);

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
  });
});
