import request from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { mergeManyOperationFactory } from 'test/integration/graphql/utils/merge-many-operation-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { upsertFieldPermissions } from 'test/integration/graphql/utils/upsert-field-permissions.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { FieldMetadataType } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const HIDDEN_DATE_FIELD_NAME = 'mergeHiddenDate';
const HIDDEN_DATE = '2026-01-15T10:00:00.000Z';
const UNREADABLE_FIELDS_ERROR =
  'These records hold data in fields your role cannot see. Ask someone with access to those fields to merge them.';

type PersonNode = {
  id: string;
  jobTitle: string;
  companyId: string | null;
  [HIDDEN_DATE_FIELD_NAME]: string | null;
};

describe('people merge with unreadable fields (integration)', () => {
  let customRoleId: string;
  let originalMemberRoleId: string;
  let hiddenDateFieldId: string;
  let companyId: string;
  let createdPersonIdsForCleaning: string[] = [];

  const createPeople = async (
    people: Record<string, unknown>[],
  ): Promise<string[]> => {
    const response = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: people.map((person, index) => ({
          name: { firstName: 'Unreadable', lastName: `Person ${index}` },
          ...person,
        })),
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const ids: string[] = response.body.data.createPeople.map(
      ({ id }: { id: string }) => id,
    );

    createdPersonIdsForCleaning.push(...ids);

    return ids;
  };

  const findPeopleByIds = async (ids: string[]): Promise<PersonNode[]> => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: `id jobTitle companyId ${HIDDEN_DATE_FIELD_NAME}`,
        filter: { id: { in: ids } },
      }),
    );

    return response.body.data.people.edges.map(
      ({ node }: { node: PersonNode }) => node,
    );
  };

  const buildMergeOperation = (ids: string[]) =>
    mergeManyOperationFactory({
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      ids,
      conflictPriorityIndex: 0,
    });

  beforeAll(async () => {
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const { objects } = await findManyObjectMetadata({
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: 'id nameSingular fieldsList { id name }',
      expectToFail: false,
    });
    const personObject = objects.find(
      (object) => object.nameSingular === 'person',
    );

    assertIsDefinedOrThrow(personObject);

    const findPersonFieldId = (fieldName: string) => {
      const field = personObject.fieldsList?.find(
        ({ name }) => name === fieldName,
      );

      assertIsDefinedOrThrow(field);

      return field.id;
    };

    const { data: hiddenDateFieldData } = await createOneFieldMetadata({
      input: {
        objectMetadataId: personObject.id,
        name: HIDDEN_DATE_FIELD_NAME,
        label: 'Merge hidden date',
        type: FieldMetadataType.DATE_TIME,
      },
      gqlFields: 'id',
      expectToFail: false,
    });

    hiddenDateFieldId = hiddenDateFieldData.createOneField.id;

    const companyResponse = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data: { name: 'Merge hidden company' },
      }),
    );

    companyId = companyResponse.body.data.createCompany.id;

    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'MergeUnreadableFieldsRole',
    });

    customRoleId = roleId;

    await upsertFieldPermissions({
      roleId: customRoleId,
      fieldPermissions: [
        'jobTitle',
        'phones',
        'company',
        HIDDEN_DATE_FIELD_NAME,
      ].map((fieldName) => ({
        objectMetadataId: personObject.id,
        fieldMetadataId:
          fieldName === HIDDEN_DATE_FIELD_NAME
            ? hiddenDateFieldId
            : findPersonFieldId(fieldName),
        canReadFieldValue: false,
        canUpdateFieldValue: false,
      })),
    });

    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
  });

  afterEach(async () => {
    await deleteRecordsByIds('person', createdPersonIdsForCleaning);
    createdPersonIdsForCleaning = [];
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      client,
      roleId: originalMemberRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    await deleteRole(client, customRoleId);

    await deleteRecordsByIds('company', [companyId]);

    await updateOneFieldMetadata({
      input: {
        idToUpdate: hiddenDateFieldId,
        updatePayload: { isActive: false },
      },
      expectToFail: false,
    });

    await deleteOneFieldMetadata({
      input: { idToDelete: hiddenDateFieldId },
      expectToFail: false,
    });
  });

  it('should refuse a merge that would drop a value the role cannot read', async () => {
    const ids = await createPeople([
      { jobTitle: '' },
      { jobTitle: 'Hidden job title' },
    ]);

    const response = await makeGraphqlApiRequestWithMemberRole(
      buildMergeOperation(ids),
    );

    expect(response.body.errors?.[0]?.extensions?.userFriendlyMessage).toBe(
      UNREADABLE_FIELDS_ERROR,
    );
    expect(await findPeopleByIds(ids)).toHaveLength(2);
  });

  it('should merge when the priority record already keeps the unreadable value', async () => {
    const [priorityId, duplicateId] = await createPeople([
      { jobTitle: 'Kept job title' },
      { jobTitle: 'Overridden job title' },
    ]);

    const response = await makeGraphqlApiRequestWithMemberRole(
      buildMergeOperation([priorityId, duplicateId]),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.mergePeople.id).toBe(priorityId);

    const people = await findPeopleByIds([priorityId, duplicateId]);

    expect(people).toHaveLength(1);
    expect(people[0]).toMatchObject({
      id: priorityId,
      jobTitle: 'Kept job title',
    });
  });

  it('should merge when records hold the same value in an unreadable composite field', async () => {
    const sharedPhones = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCallingCode: '+33',
      primaryPhoneCountryCode: 'FR',
      additionalPhones: [],
    };
    const [priorityId, duplicateId] = await createPeople([
      { phones: sharedPhones },
      { phones: sharedPhones },
    ]);

    const response = await makeGraphqlApiRequestWithMemberRole(
      buildMergeOperation([priorityId, duplicateId]),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.mergePeople.id).toBe(priorityId);
  });

  it('should refuse a merge that would drop an unreadable date only a duplicate holds', async () => {
    const ids = await createPeople([
      {},
      { [HIDDEN_DATE_FIELD_NAME]: HIDDEN_DATE },
    ]);

    const response = await makeGraphqlApiRequestWithMemberRole(
      buildMergeOperation(ids),
    );

    expect(response.body.errors?.[0]?.extensions?.userFriendlyMessage).toBe(
      UNREADABLE_FIELDS_ERROR,
    );
    expect(await findPeopleByIds(ids)).toHaveLength(2);
  });

  it('should refuse a merge that would drop an unreadable relation two duplicates hold', async () => {
    const ids = await createPeople([{}, { companyId }, { companyId }]);

    const response = await makeGraphqlApiRequestWithMemberRole(
      buildMergeOperation(ids),
    );

    expect(response.body.errors?.[0]?.extensions?.userFriendlyMessage).toBe(
      UNREADABLE_FIELDS_ERROR,
    );
    expect(await findPeopleByIds(ids)).toHaveLength(3);
  });

  it('should carry a date and a relation held only by duplicates when every field is readable', async () => {
    const [priorityId, ...duplicateIds] = await createPeople([
      {},
      { companyId, [HIDDEN_DATE_FIELD_NAME]: HIDDEN_DATE },
      { companyId },
    ]);

    const response = await makeGraphqlApiRequest(
      buildMergeOperation([priorityId, ...duplicateIds]),
    );

    expect(response.body.errors).toBeUndefined();

    const people = await findPeopleByIds([priorityId, ...duplicateIds]);

    expect(people).toHaveLength(1);
    expect(people[0]).toMatchObject({
      id: priorityId,
      companyId,
      [HIDDEN_DATE_FIELD_NAME]: HIDDEN_DATE,
    });
  });
});
