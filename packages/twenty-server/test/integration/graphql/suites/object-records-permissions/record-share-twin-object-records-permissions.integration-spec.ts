import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
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

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { isRecordSharedWithPrincipals } from 'src/engine/record-share/utils/is-record-shared-with-principals.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/twenty-orm/repository/resolve-required-record-share-access-levels.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_SINGULAR = 'recordShareTwinObject';
const OBJECT_PLURAL = 'recordShareTwinObjects';
const UPDATE_RESPONSE_KEY = `update${capitalize(OBJECT_PLURAL)}`;
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

const ALL_RECORD_IDS = Object.values(RECORD_IDS);
const ALL_RECORDS_FILTER = { id: { in: ALL_RECORD_IDS } };

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

describe('recordShareTwinObjectRecordsPermissions', () => {
  let recordShareService: RecordShareService;
  let objectMetadataId: string;
  let recordShares: RecordShare[];
  let memberRoleId: string;
  let adminRoleId: string;

  const sourceId = randomUUID();

  const recordIdsSharedInMemory = ({
    principalIds,
    operationType,
  }: {
    principalIds: string[];
    operationType: 'select' | 'update';
  }) =>
    ALL_RECORD_IDS.filter((recordId) =>
      isRecordSharedWithPrincipals({
        recordShares,
        recordId,
        principalIds,
        accessLevels: resolveRequiredRecordShareAccessLevels(operationType),
      }),
    ).sort();

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');

    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_SINGULAR,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Record Share Twin Object',
        labelPlural: 'Record Share Twin Objects',
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

    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;

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
          principalId: memberRoleId,
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
          principalId: adminRoleId,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.FULL,
        }),
      ],
    });

    recordShares = await recordShareService.findByRecordIds({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
      recordIds: ALL_RECORD_IDS,
    });

    await setObjectReadability(objectMetadataId, MetadataReadability.PRIVATE);
    await setRecordSharingEnabled(true);
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
        objectMetadataSingularName: OBJECT_SINGULAR,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: ALL_RECORDS_FILTER,
      }),
    );
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

  it('should fetch one row per share of the batch', () => {
    expect(recordShares).toHaveLength(4);
    expect(
      recordShares.every(
        (recordShare) => recordShare.objectMetadataId === objectMetadataId,
      ),
    ).toBe(true);
  });

  it('should read the same records in memory as the SQL gate for the admin', async () => {
    const response = await makeGraphqlAPIRequest(findManyOperation);

    expect(response.body.errors).toBeUndefined();
    expect(collectIds(response.body.data[OBJECT_PLURAL].edges)).toEqual(
      recordIdsSharedInMemory({
        principalIds: [
          EVERYONE_PRINCIPAL_ID,
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          adminRoleId,
        ],
        operationType: 'select',
      }),
    );
  });

  it('should read the same records in memory as the SQL gate for the member', async () => {
    const response =
      await makeGraphqlAPIRequestWithMemberRole(findManyOperation);

    expect(response.body.errors).toBeUndefined();
    expect(collectIds(response.body.data[OBJECT_PLURAL].edges)).toEqual(
      recordIdsSharedInMemory({
        principalIds: [
          EVERYONE_PRINCIPAL_ID,
          WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          memberRoleId,
        ],
        operationType: 'select',
      }),
    );
  });

  it('should read the same records in memory as the SQL gate for the api key', async () => {
    const response = await makeGraphqlAPIRequestWithApiKey(findManyOperation);

    expect(response.body.errors).toBeUndefined();
    expect(collectIds(response.body.data[OBJECT_PLURAL].edges)).toEqual(
      recordIdsSharedInMemory({
        principalIds: [EVERYONE_PRINCIPAL_ID, adminRoleId],
        operationType: 'select',
      }),
    );
  });

  it('should update the same records in memory as the SQL gate for the member', async () => {
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
      recordIdsSharedInMemory({
        principalIds: [
          EVERYONE_PRINCIPAL_ID,
          WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          memberRoleId,
        ],
        operationType: 'update',
      }),
    );
  });
});
