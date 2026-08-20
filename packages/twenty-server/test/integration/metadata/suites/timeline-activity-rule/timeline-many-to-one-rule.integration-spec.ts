import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const UPSERT_TIMELINE_ACTIVITY_RULE = gql`
  mutation UpsertTimelineActivityRule($input: UpsertTimelineActivityRuleInput!) {
    upsertTimelineActivityRule(input: $input) {
      id
      objectMetadataId
      relationFieldMetadataId
      actions
      isStandard
    }
  }
`;

const RESET_TIMELINE_ACTIVITY_RULE = gql`
  mutation ResetTimelineActivityRule($input: ResetTimelineActivityRuleInput!) {
    resetTimelineActivityRule(input: $input) {
      id
    }
  }
`;

// Random per run so the suite stays re-runnable without a database reset.
const COMPANY_A_ID = v4();
const COMPANY_B_ID = v4();
const COMPANY_C_ID = v4();
const PERSON_MOVED_ID = v4();
const PERSON_RENAMED_ID = v4();

let personObjectMetadataId = '';
let companyFieldMetadataId = '';

const findEntriesOnCompany = async ({
  companyId,
  name,
}: {
  companyId: string;
  name: string;
}): Promise<{ name: string; action: string | null }[]> => {
  await waitForAllJobsToFinish();

  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: 'id name action',
      filter: {
        targetCompanyId: { eq: companyId },
        name: { eq: name },
      },
      first: 10,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.timelineActivities.edges.map(
    (edge: { node: { name: string; action: string | null } }) => edge.node,
  );
};

const createRecord = async ({
  objectMetadataSingularName,
  data,
}: {
  objectMetadataSingularName: string;
  data: object;
}): Promise<void> => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

describe('timeline activity rule on a many-to-one lookup (integration)', () => {
  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: 'id nameSingular fieldsList { id name }',
    });

    const personObjectMetadata = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'person',
    );

    expect(personObjectMetadata).toBeDefined();

    personObjectMetadataId = personObjectMetadata?.id as string;

    const companyFieldMetadata = personObjectMetadata?.fieldsList?.find(
      (fieldMetadata) => fieldMetadata.name === 'company',
    );

    expect(companyFieldMetadata).toBeDefined();

    companyFieldMetadataId = companyFieldMetadata?.id as string;

    // Reset drops a leftover rule from a previous run.
    await makeMetadataAPIRequest({
      query: RESET_TIMELINE_ACTIVITY_RULE,
      variables: {
        input: {
          objectMetadataId: personObjectMetadataId,
          relationFieldMetadataId: companyFieldMetadataId,
        },
      },
    });

    const upsertResponse = await makeMetadataAPIRequest({
      query: UPSERT_TIMELINE_ACTIVITY_RULE,
      variables: {
        input: {
          objectMetadataId: personObjectMetadataId,
          relationFieldMetadataId: companyFieldMetadataId,
          actions: ['linked', 'unlinked', 'updated'],
        },
      },
    });

    expect(upsertResponse.body.errors).toBeUndefined();
    expect(upsertResponse.body.data.upsertTimelineActivityRule.isStandard).toBe(
      false,
    );

    for (const companyId of [COMPANY_A_ID, COMPANY_B_ID, COMPANY_C_ID]) {
      await createRecord({
        objectMetadataSingularName: 'company',
        data: { id: companyId, name: `Lookup rule co ${companyId}` },
      });
    }
  });

  afterAll(async () => {
    if (
      !isDefined(personObjectMetadataId) ||
      !isDefined(companyFieldMetadataId)
    ) {
      return;
    }

    await makeMetadataAPIRequest({
      query: RESET_TIMELINE_ACTIVITY_RULE,
      variables: {
        input: {
          objectMetadataId: personObjectMetadataId,
          relationFieldMetadataId: companyFieldMetadataId,
        },
      },
    });
  });

  it('should write a linked entry on the company when a person is created with it', async () => {
    await createRecord({
      objectMetadataSingularName: 'person',
      data: {
        id: PERSON_MOVED_ID,
        companyId: COMPANY_A_ID,
        name: { firstName: 'Grace', lastName: 'Hopper' },
      },
    });

    const entries = await findEntriesOnCompany({
      companyId: COMPANY_A_ID,
      name: 'linked-person.created',
    });

    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('linked');
  });

  it('should unlink the old company and link the new one when the lookup changes', async () => {
    const response = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: PERSON_MOVED_ID,
        data: { companyId: COMPANY_B_ID },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const oldCompanyEntries = await findEntriesOnCompany({
      companyId: COMPANY_A_ID,
      name: 'linked-person.updated',
    });
    const newCompanyEntries = await findEntriesOnCompany({
      companyId: COMPANY_B_ID,
      name: 'linked-person.updated',
    });

    expect(oldCompanyEntries).toHaveLength(1);
    expect(oldCompanyEntries[0].action).toBe('unlinked');
    expect(newCompanyEntries).toHaveLength(1);
    expect(newCompanyEntries[0].action).toBe('linked');
  });

  it('should write an updated entry on the company when the person changes', async () => {
    await createRecord({
      objectMetadataSingularName: 'person',
      data: {
        id: PERSON_RENAMED_ID,
        companyId: COMPANY_C_ID,
        name: { firstName: 'Ada', lastName: 'Lovelace' },
      },
    });

    const renameResponse = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: PERSON_RENAMED_ID,
        data: { name: { firstName: 'Ada', lastName: 'King' } },
      }),
    );

    expect(renameResponse.body.errors).toBeUndefined();

    const entries = await findEntriesOnCompany({
      companyId: COMPANY_C_ID,
      name: 'linked-person.updated',
    });

    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('updated');
  });

  it('should unlink the company when the person is deleted', async () => {
    const response = await makeGraphqlAPIRequest(
      deleteOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: PERSON_RENAMED_ID,
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const entries = await findEntriesOnCompany({
      companyId: COMPANY_C_ID,
      name: 'linked-person.deleted',
    });

    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('unlinked');
  });
});
