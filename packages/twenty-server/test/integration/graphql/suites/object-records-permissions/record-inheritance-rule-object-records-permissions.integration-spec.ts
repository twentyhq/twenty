/* @license Enterprise */

import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { setObjectReadability } from 'test/integration/metadata/suites/object-metadata/utils/set-object-readability.util';
import { createRecordInheritanceRule } from 'test/integration/metadata/suites/record-inheritance-rule/utils/create-record-inheritance-rule.util';
import { deleteRecordInheritanceRule } from 'test/integration/metadata/suites/record-inheritance-rule/utils/delete-record-inheritance-rule.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SHARED_COMPANY_ID = randomUUID();
const HIDDEN_COMPANY_ID = randomUUID();
const PERSON_OF_SHARED_COMPANY_ID = randomUUID();
const PERSON_OF_HIDDEN_COMPANY_ID = randomUUID();
const PERSON_WITHOUT_COMPANY_ID = randomUUID();
const NOTE_OF_SHARED_COMPANY_ID = randomUUID();
const NOTE_OF_HIDDEN_COMPANY_ID = randomUUID();
const NOTE_OF_PERSON_ONLY_ID = randomUUID();
const NOTE_TARGET_IDS = [randomUUID(), randomUUID(), randomUUID()];

const PERSON_IDS = [
  PERSON_OF_SHARED_COMPANY_ID,
  PERSON_OF_HIDDEN_COMPANY_ID,
  PERSON_WITHOUT_COMPANY_ID,
];
const NOTE_IDS = [
  NOTE_OF_SHARED_COMPANY_ID,
  NOTE_OF_HIDDEN_COMPANY_ID,
  NOTE_OF_PERSON_ONLY_ID,
];

const collectIds = (edges: { node: { id: string } }[]): string[] =>
  edges.map((edge) => edge.node.id).sort();

const findIds = async ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  ids,
}: {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  ids: string[];
}) => {
  const response = await makeGraphqlApiRequestWithMemberRole(
    findManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields: 'id',
      filter: { id: { in: ids } },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return collectIds(response.body.data[objectMetadataPluralName].edges);
};

const findObjectMetadata = (nameSingular: string) =>
  getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity).findOneOrFail({
    where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular },
  });

const findFieldMetadataId = async ({
  objectMetadataId,
  name,
}: {
  objectMetadataId: string;
  name: string;
}): Promise<string> =>
  (
    await getCoreRepository<FieldMetadataEntity>(
      FieldMetadataEntity,
    ).findOneOrFail({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, objectMetadataId, name },
    })
  ).id;

describe('recordInheritanceRuleObjectRecordsPermissions', () => {
  let recordShareStorageService: RecordShareStorageService;
  let companyObjectMetadata: ObjectMetadataEntity;
  let noteObjectMetadata: ObjectMetadataEntity;
  const recordInheritanceRuleIds: string[] = [];
  const sourceId = randomUUID();

  beforeAll(async () => {
    recordShareStorageService =
      getAppProviderByClassName<RecordShareStorageService>(
        'RecordShareStorageService',
      );

    companyObjectMetadata = await findObjectMetadata('company');
    noteObjectMetadata = await findObjectMetadata('note');

    const personObjectMetadata = await findObjectMetadata('person');
    const noteTargetObjectMetadata = await findObjectMetadata('noteTarget');

    const createRecords = [
      {
        objectMetadataSingularName: 'company',
        data: { id: SHARED_COMPANY_ID, name: 'Shared company' },
      },
      {
        objectMetadataSingularName: 'company',
        data: { id: HIDDEN_COMPANY_ID, name: 'Hidden company' },
      },
      {
        objectMetadataSingularName: 'person',
        data: {
          id: PERSON_OF_SHARED_COMPANY_ID,
          name: { firstName: 'Shared' },
          companyId: SHARED_COMPANY_ID,
        },
      },
      {
        objectMetadataSingularName: 'person',
        data: {
          id: PERSON_OF_HIDDEN_COMPANY_ID,
          name: { firstName: 'Hidden' },
          companyId: HIDDEN_COMPANY_ID,
        },
      },
      {
        objectMetadataSingularName: 'person',
        data: { id: PERSON_WITHOUT_COMPANY_ID, name: { firstName: 'Alone' } },
      },
      ...NOTE_IDS.map((id) => ({
        objectMetadataSingularName: 'note',
        data: { id, title: 'Record inheritance rule note' },
      })),
      {
        objectMetadataSingularName: 'noteTarget',
        data: {
          id: NOTE_TARGET_IDS[0],
          noteId: NOTE_OF_SHARED_COMPANY_ID,
          targetCompanyId: SHARED_COMPANY_ID,
        },
      },
      {
        objectMetadataSingularName: 'noteTarget',
        data: {
          id: NOTE_TARGET_IDS[1],
          noteId: NOTE_OF_HIDDEN_COMPANY_ID,
          targetCompanyId: HIDDEN_COMPANY_ID,
        },
      },
      {
        objectMetadataSingularName: 'noteTarget',
        data: {
          id: NOTE_TARGET_IDS[2],
          noteId: NOTE_OF_PERSON_ONLY_ID,
          targetPersonId: PERSON_WITHOUT_COMPANY_ID,
        },
      },
    ];

    for (const { objectMetadataSingularName, data } of createRecords) {
      const response = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName,
          gqlFields: 'id',
          data,
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    for (const input of [
      {
        objectMetadataId: personObjectMetadata.id,
        fieldMetadataId: await findFieldMetadataId({
          objectMetadataId: personObjectMetadata.id,
          name: 'company',
        }),
      },
      {
        objectMetadataId: noteObjectMetadata.id,
        fieldMetadataId: await findFieldMetadataId({
          objectMetadataId: noteObjectMetadata.id,
          name: 'noteTargets',
        }),
        junctionFieldMetadataId: await findFieldMetadataId({
          objectMetadataId: noteTargetObjectMetadata.id,
          name: 'targetCompany',
        }),
      },
    ]) {
      const { errors, recordInheritanceRule } =
        await createRecordInheritanceRule(input);

      expect(errors).toBeUndefined();
      jestExpectToBeDefined(recordInheritanceRule);
      recordInheritanceRuleIds.push(recordInheritanceRule.id);
    }

    await recordShareStorageService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        {
          recordId: SHARED_COMPANY_ID,
          objectMetadataId: companyObjectMetadata.id,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId,
        },
      ],
    });

    await setObjectReadability(
      companyObjectMetadata.id,
      MetadataReadability.PRIVATE,
    );
    await setObjectReadability(
      noteObjectMetadata.id,
      MetadataReadability.PRIVATE,
    );
  });

  afterAll(async () => {
    await setObjectReadability(
      companyObjectMetadata.id,
      companyObjectMetadata.readability,
    );
    await setObjectReadability(
      noteObjectMetadata.id,
      noteObjectMetadata.readability,
    );

    for (const recordInheritanceRuleId of recordInheritanceRuleIds) {
      await deleteRecordInheritanceRule(recordInheritanceRuleId);
    }

    await recordShareStorageService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });

    for (const [objectMetadataSingularName, objectMetadataPluralName, ids] of [
      ['noteTarget', 'noteTargets', NOTE_TARGET_IDS],
      ['note', 'notes', NOTE_IDS],
      ['person', 'people', PERSON_IDS],
      ['company', 'companies', [SHARED_COMPANY_ID, HIDDEN_COMPANY_ID]],
    ] as const) {
      await makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName,
          objectMetadataPluralName,
          gqlFields: 'id',
          filter: { id: { in: [...ids] } },
        }),
      );
    }
  });

  it('should hide the people of a company the member cannot see and keep people without a company', async () => {
    expect(
      await findIds({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        ids: PERSON_IDS,
      }),
    ).toEqual([PERSON_OF_SHARED_COMPANY_ID, PERSON_WITHOUT_COMPANY_ID].sort());
  });

  it('should follow a two hop rule through note targets to the company', async () => {
    expect(
      await findIds({
        objectMetadataSingularName: 'note',
        objectMetadataPluralName: 'notes',
        ids: NOTE_IDS,
      }),
    ).toEqual([NOTE_OF_SHARED_COMPANY_ID]);
  });
});
