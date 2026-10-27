import request from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { mergeManyOperationFactory } from 'test/integration/graphql/utils/merge-many-operation-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { upsertFieldPermissions } from 'test/integration/graphql/utils/upsert-field-permissions.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

describe('people merge with unreadable fields (integration)', () => {
  let customRoleId: string;
  let originalMemberRoleId: string;
  let createdPersonIdsForCleaning: string[] = [];

  const createPeoplePair = async ({
    priorityJobTitle,
    duplicateJobTitle,
    sharedPhones,
  }: {
    priorityJobTitle: string;
    duplicateJobTitle: string;
    sharedPhones?: object;
  }) => {
    const response = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: [
          {
            name: { firstName: 'Unreadable', lastName: 'Priority' },
            jobTitle: priorityJobTitle,
            phones: sharedPhones,
          },
          {
            name: { firstName: 'Unreadable', lastName: 'Duplicate' },
            jobTitle: duplicateJobTitle,
            phones: sharedPhones,
          },
        ],
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const [priorityPerson, duplicatePerson] = response.body.data.createPeople;

    createdPersonIdsForCleaning.push(priorityPerson.id, duplicatePerson.id);

    return { priorityId: priorityPerson.id, duplicateId: duplicatePerson.id };
  };

  const findPeopleByIds = async (ids: string[]) => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id jobTitle',
        filter: { id: { in: ids } },
      }),
    );

    return response.body.data.people.edges.map(
      ({ node }: { node: { id: string; jobTitle: string } }) => node,
    );
  };

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
    const jobTitleField = personObject?.fieldsList?.find(
      (field) => field.name === 'jobTitle',
    );
    const phonesField = personObject?.fieldsList?.find(
      (field) => field.name === 'phones',
    );

    assertIsDefinedOrThrow(personObject);
    assertIsDefinedOrThrow(jobTitleField);
    assertIsDefinedOrThrow(phonesField);

    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'MergeUnreadableJobTitleRole',
    });

    customRoleId = roleId;

    await upsertFieldPermissions({
      roleId: customRoleId,
      fieldPermissions: [
        {
          objectMetadataId: personObject.id,
          fieldMetadataId: jobTitleField.id,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        },
        {
          objectMetadataId: personObject.id,
          fieldMetadataId: phonesField.id,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        },
      ],
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
  });

  it('should refuse a merge that would drop a value the role cannot read', async () => {
    const { priorityId, duplicateId } = await createPeoplePair({
      priorityJobTitle: '',
      duplicateJobTitle: 'Hidden job title',
    });

    const response = await makeGraphqlApiRequestWithMemberRole(
      mergeManyOperationFactory({
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        ids: [priorityId, duplicateId],
        conflictPriorityIndex: 0,
      }),
    );

    expect(response.body.errors?.[0]?.extensions?.userFriendlyMessage).toBe(
      'These records hold data in fields your role cannot see. Ask someone with access to those fields to merge them.',
    );

    const people = await findPeopleByIds([priorityId, duplicateId]);

    expect(people).toHaveLength(2);
  });

  it('should merge when the priority record already keeps the unreadable value', async () => {
    const { priorityId, duplicateId } = await createPeoplePair({
      priorityJobTitle: 'Kept job title',
      duplicateJobTitle: 'Overridden job title',
    });

    const response = await makeGraphqlApiRequestWithMemberRole(
      mergeManyOperationFactory({
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        ids: [priorityId, duplicateId],
        conflictPriorityIndex: 0,
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.mergePeople.id).toBe(priorityId);

    const people = await findPeopleByIds([priorityId, duplicateId]);

    expect(people).toEqual([{ id: priorityId, jobTitle: 'Kept job title' }]);
  });

  it('should merge when records hold the same value in an unreadable composite field', async () => {
    const { priorityId, duplicateId } = await createPeoplePair({
      priorityJobTitle: '',
      duplicateJobTitle: '',
      sharedPhones: {
        primaryPhoneNumber: '123456789',
        primaryPhoneCallingCode: '+33',
        primaryPhoneCountryCode: 'FR',
        additionalPhones: [],
      },
    });

    const response = await makeGraphqlApiRequestWithMemberRole(
      mergeManyOperationFactory({
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        ids: [priorityId, duplicateId],
        conflictPriorityIndex: 0,
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.mergePeople.id).toBe(priorityId);
  });
});
