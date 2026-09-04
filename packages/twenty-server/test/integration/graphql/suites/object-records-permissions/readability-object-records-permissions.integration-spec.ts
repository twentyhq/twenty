import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
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
import { capitalize } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_SINGULAR = 'readabilityTestObject';
const OBJECT_PLURAL = 'readabilityTestObjects';
const UPDATE_RESPONSE_KEY = `update${capitalize(OBJECT_PLURAL)}`;
const DELETE_RESPONSE_KEY = `delete${capitalize(OBJECT_PLURAL)}`;
const RESTORE_RESPONSE_KEY = `restore${capitalize(OBJECT_PLURAL)}`;
const DESTROY_RESPONSE_KEY = `destroy${capitalize(OBJECT_PLURAL)}`;
const GROUP_BY_RESPONSE_KEY = `${OBJECT_PLURAL}GroupBy`;
const RECORD_GQL_FIELDS = `
  id
  name
`;

const RECORD_IDS = {
  SHARED_READ_WITH_JONY: randomUUID(),
  SHARED_READ_WRITE_WITH_MEMBER_ROLE: randomUUID(),
  SHARED_FULL_WITH_EVERYONE: randomUUID(),
  SHARED_FULL_WITH_ADMIN_ROLE: randomUUID(),
  UNSHARED: randomUUID(),
};

const PERSON_IDS = {
  SHARED_READ_WITH_JONY: randomUUID(),
  SHARED_READ_WRITE_WITH_MEMBER_ROLE: randomUUID(),
  SHARED_FULL_WITH_EVERYONE: randomUUID(),
  SHARED_FULL_WITH_ADMIN_ROLE: randomUUID(),
  UNSHARED: randomUUID(),
};

const ALL_RECORD_IDS = Object.values(RECORD_IDS);
const ALL_PERSON_IDS = Object.values(PERSON_IDS);

const ALL_RECORDS_FILTER = { id: { in: ALL_RECORD_IDS } };
const ALL_PEOPLE_FILTER = { id: { in: ALL_PERSON_IDS } };

const collectIds = (edges: { node: { id: string } }[]): string[] =>
  edges.map((edge) => edge.node.id).sort();

const collectRecordIds = (records: { id: string }[]): string[] =>
  records.map((record) => record.id).sort();

const findManyOperation = findManyOperationFactory({
  objectMetadataSingularName: OBJECT_SINGULAR,
  objectMetadataPluralName: OBJECT_PLURAL,
  gqlFields: RECORD_GQL_FIELDS,
  filter: ALL_RECORDS_FILTER,
});

const totalCountOperation = {
  query: gql`
    query ReadabilityTestObjectsTotalCount(
      $filter: ReadabilityTestObjectFilterInput
    ) {
      readabilityTestObjects(filter: $filter) {
        totalCount
      }
    }
  `,
  variables: { filter: ALL_RECORDS_FILTER },
};

const setObjectReadability = async (
  objectMetadataId: string,
  readability: MetadataReadability,
) => {
  await getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity).update(
    objectMetadataId,
    { readability },
  );

  const { errors } = await updateOneObjectMetadata({
    expectToFail: false,
    input: {
      idToUpdate: objectMetadataId,
      updatePayload: { description: `readability set to ${readability}` },
    },
  });

  expect(errors).toBeUndefined();
};

const setRecordSharingEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
    value,
    expectToFail: false,
  });

describe('readabilityObjectRecordsPermissions', () => {
  let recordShareService: RecordShareService;
  let objectMetadataId: string;
  let personRelationFieldMetadataId: string;

  const sourceId = randomUUID();

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');

    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_SINGULAR,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Readability Test Object',
        labelPlural: 'Readability Test Objects',
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
        label: 'Readability Test Object',
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

    for (const [name, id] of Object.entries(RECORD_IDS)) {
      const response = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: RECORD_GQL_FIELDS,
          data: { id, name },
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    for (const [name, id] of Object.entries(PERSON_IDS)) {
      const response = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          data: {
            id,
            name: { firstName: name },
            [`${OBJECT_SINGULAR}Id`]:
              RECORD_IDS[name as keyof typeof RECORD_IDS],
          },
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    const memberRole = await findOneRoleByLabel({ label: 'Member' });
    const adminRole = await findOneRoleByLabel({ label: 'Admin' });

    const buildRecordShare = ({
      recordId,
      principalId,
      principalType,
      accessLevel,
    }: {
      recordId: string;
      principalId: string;
      principalType: RecordSharePrincipalType;
      accessLevel: RecordShareAccessLevel;
    }) => ({
      recordId,
      objectMetadataId,
      principalId,
      principalType,
      accessLevel,
      rowCause: RecordShareRowCause.MANUAL,
      sourceId,
    });

    await recordShareService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        buildRecordShare({
          recordId: RECORD_IDS.SHARED_READ_WITH_JONY,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.READ,
        }),
        buildRecordShare({
          recordId: RECORD_IDS.SHARED_READ_WRITE_WITH_MEMBER_ROLE,
          principalId: memberRole.id,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
        }),
        buildRecordShare({
          recordId: RECORD_IDS.SHARED_FULL_WITH_EVERYONE,
          principalId: EVERYONE_PRINCIPAL_ID,
          principalType: RecordSharePrincipalType.EVERYONE,
          accessLevel: RecordShareAccessLevel.FULL,
        }),
        buildRecordShare({
          recordId: RECORD_IDS.SHARED_FULL_WITH_ADMIN_ROLE,
          principalId: adminRole.id,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.FULL,
        }),
      ],
    });
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);
    await recordShareService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });
    await setObjectReadability(objectMetadataId, MetadataReadability.OPEN);
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: ALL_PEOPLE_FILTER,
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

    it('should only return records shared with the admin principals', async () => {
      const response = await makeGraphqlAPIRequest(findManyOperation);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[OBJECT_PLURAL].edges)).toEqual(
        [
          RECORD_IDS.SHARED_FULL_WITH_EVERYONE,
          RECORD_IDS.SHARED_FULL_WITH_ADMIN_ROLE,
        ].sort(),
      );
    });

    it('should only return records shared with the member, their role or everyone', async () => {
      const response =
        await makeGraphqlAPIRequestWithMemberRole(findManyOperation);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[OBJECT_PLURAL].edges)).toEqual(
        [
          RECORD_IDS.SHARED_READ_WITH_JONY,
          RECORD_IDS.SHARED_READ_WRITE_WITH_MEMBER_ROLE,
          RECORD_IDS.SHARED_FULL_WITH_EVERYONE,
        ].sort(),
      );
    });

    it('should only return records shared with the api key role or everyone', async () => {
      const response = await makeGraphqlAPIRequestWithApiKey(findManyOperation);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[OBJECT_PLURAL].edges)).toEqual(
        [
          RECORD_IDS.SHARED_FULL_WITH_EVERYONE,
          RECORD_IDS.SHARED_FULL_WITH_ADMIN_ROLE,
        ].sort(),
      );
    });

    it('should count only the records visible to the member', async () => {
      const response =
        await makeGraphqlAPIRequestWithMemberRole(totalCountOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data[OBJECT_PLURAL].totalCount).toBe(3);
    });

    it('should group only the records visible to the member', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        groupByOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          objectMetadataPluralName: OBJECT_PLURAL,
          groupBy: [{ name: true }],
          filter: ALL_RECORDS_FILTER,
        }),
      );

      expect(response.body.errors).toBeUndefined();

      const groupedNames = response.body.data[GROUP_BY_RESPONSE_KEY]
        .flatMap(
          (group: { groupByDimensionValues: string[] }) =>
            group.groupByDimensionValues,
        )
        .sort();

      expect(groupedNames).toEqual([
        'SHARED_FULL_WITH_EVERYONE',
        'SHARED_READ_WITH_JONY',
        'SHARED_READ_WRITE_WITH_MEMBER_ROLE',
      ]);
    });

    it('should only hydrate the visible records on a nested relation read', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: `
            id
            ${OBJECT_SINGULAR} {
              id
            }
          `,
          filter: ALL_PEOPLE_FILTER,
        }),
      );

      expect(response.body.errors).toBeUndefined();

      const relatedRecordIdByPersonId = Object.fromEntries(
        response.body.data.people.edges.map(
          (edge: {
            node: { id: string; [OBJECT_SINGULAR]: { id: string } };
          }) => [edge.node.id, edge.node[OBJECT_SINGULAR]?.id ?? null],
        ),
      );

      expect(relatedRecordIdByPersonId).toEqual({
        [PERSON_IDS.SHARED_READ_WITH_JONY]: RECORD_IDS.SHARED_READ_WITH_JONY,
        [PERSON_IDS.SHARED_READ_WRITE_WITH_MEMBER_ROLE]:
          RECORD_IDS.SHARED_READ_WRITE_WITH_MEMBER_ROLE,
        [PERSON_IDS.SHARED_FULL_WITH_EVERYONE]:
          RECORD_IDS.SHARED_FULL_WITH_EVERYONE,
        [PERSON_IDS.SHARED_FULL_WITH_ADMIN_ROLE]: null,
        [PERSON_IDS.UNSHARED]: null,
      });
    });

    it('should only match relation filters through the visible records', async () => {
      const findPeopleThroughRecordName = (name: string) =>
        makeGraphqlAPIRequestWithMemberRole(
          findManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            filter: { [OBJECT_SINGULAR]: { name: { eq: name } } },
          }),
        );

      const hiddenResponse = await findPeopleThroughRecordName('UNSHARED');
      const visibleResponse = await findPeopleThroughRecordName(
        'SHARED_READ_WITH_JONY',
      );

      expect(hiddenResponse.body.errors).toBeUndefined();
      expect(hiddenResponse.body.data.people.edges).toHaveLength(0);
      expect(visibleResponse.body.errors).toBeUndefined();
      expect(collectIds(visibleResponse.body.data.people.edges)).toEqual([
        PERSON_IDS.SHARED_READ_WITH_JONY,
      ]);
    });

    it('should only update the records shared with at least READ_WRITE access', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        updateManyOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          objectMetadataPluralName: OBJECT_PLURAL,
          gqlFields: RECORD_GQL_FIELDS,
          data: { name: 'updated by member' },
          filter: ALL_RECORDS_FILTER,
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(collectRecordIds(response.body.data[UPDATE_RESPONSE_KEY])).toEqual(
        [
          RECORD_IDS.SHARED_READ_WRITE_WITH_MEMBER_ROLE,
          RECORD_IDS.SHARED_FULL_WITH_EVERYONE,
        ].sort(),
      );

      const readOnlyRecordResponse = await makeGraphqlAPIRequestWithMemberRole(
        findOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: RECORD_GQL_FIELDS,
          filter: { id: { eq: RECORD_IDS.SHARED_READ_WITH_JONY } },
        }),
      );

      expect(readOnlyRecordResponse.body.data[OBJECT_SINGULAR].name).toBe(
        'SHARED_READ_WITH_JONY',
      );
    });

    it('should only soft delete, restore and destroy the records shared with FULL access', async () => {
      const deleteResponse = await makeGraphqlAPIRequestWithMemberRole(
        deleteManyOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          objectMetadataPluralName: OBJECT_PLURAL,
          gqlFields: RECORD_GQL_FIELDS,
          filter: ALL_RECORDS_FILTER,
        }),
      );

      expect(deleteResponse.body.errors).toBeUndefined();
      expect(
        collectRecordIds(deleteResponse.body.data[DELETE_RESPONSE_KEY]),
      ).toEqual([RECORD_IDS.SHARED_FULL_WITH_EVERYONE]);

      const restoreResponse = await makeGraphqlAPIRequestWithMemberRole(
        restoreManyOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          objectMetadataPluralName: OBJECT_PLURAL,
          gqlFields: RECORD_GQL_FIELDS,
          filter: ALL_RECORDS_FILTER,
        }),
      );

      expect(restoreResponse.body.errors).toBeUndefined();
      expect(
        collectRecordIds(restoreResponse.body.data[RESTORE_RESPONSE_KEY]),
      ).toEqual([RECORD_IDS.SHARED_FULL_WITH_EVERYONE]);

      const destroyResponse = await makeGraphqlAPIRequestWithMemberRole(
        destroyManyOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          objectMetadataPluralName: OBJECT_PLURAL,
          gqlFields: RECORD_GQL_FIELDS,
          filter: ALL_RECORDS_FILTER,
        }),
      );

      expect(destroyResponse.body.errors).toBeUndefined();
      expect(
        collectRecordIds(destroyResponse.body.data[DESTROY_RESPONSE_KEY]),
      ).toEqual([RECORD_IDS.SHARED_FULL_WITH_EVERYONE]);

      const remainingResponse =
        await makeGraphqlAPIRequestWithMemberRole(findManyOperation);

      expect(
        collectIds(remainingResponse.body.data[OBJECT_PLURAL].edges),
      ).toEqual(
        [
          RECORD_IDS.SHARED_READ_WITH_JONY,
          RECORD_IDS.SHARED_READ_WRITE_WITH_MEMBER_ROLE,
        ].sort(),
      );
    });
  });

  describe('SYSTEM readability with record sharing enabled', () => {
    beforeAll(async () => {
      await setObjectReadability(objectMetadataId, MetadataReadability.SYSTEM);
      await setRecordSharingEnabled(true);
    });

    it('should refuse reads even for an admin', async () => {
      const response = await makeGraphqlAPIRequest(findManyOperation);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not readable');
    });
  });

  describe('PRIVATE readability with record sharing disabled', () => {
    beforeAll(async () => {
      await setObjectReadability(objectMetadataId, MetadataReadability.PRIVATE);
      await setRecordSharingEnabled(false);
    });

    it('should return every record', async () => {
      const response = await makeGraphqlAPIRequest(findManyOperation);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[OBJECT_PLURAL].edges)).toEqual(
        [
          RECORD_IDS.SHARED_READ_WITH_JONY,
          RECORD_IDS.SHARED_READ_WRITE_WITH_MEMBER_ROLE,
          RECORD_IDS.SHARED_FULL_WITH_ADMIN_ROLE,
          RECORD_IDS.UNSHARED,
        ].sort(),
      );
    });
  });
});
