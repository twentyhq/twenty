import { randomUUID } from 'node:crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { isDefined } from 'twenty-shared/utils';

export const SEEDED_JOB_TITLE = 'Seeded job title';

export type TestPerson = {
  status: 'active' | 'softDeleted' | 'absent';
  jobTitle?: string;
};

const testPersonIds: string[] = [];

// Ids for records a test is about to create, tracked so deleteTestPeople
// removes them too.
export const reserveTestPersonIds = (count: number) => {
  const ids = Array.from({ length: count }, () => randomUUID());

  testPersonIds.push(...ids);

  return ids;
};

// Created as the seeded admin, so setup never depends on the grants under test.
export const createTestPeople = async ({
  count,
  isSoftDeleted = false,
}: {
  count: number;
  isSoftDeleted?: boolean;
}) => {
  const ids = reserveTestPersonIds(count);

  const createResponse = await makeGraphqlApiRequest(
    createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: ids.map((id) => ({ id, jobTitle: SEEDED_JOB_TITLE })),
    }),
  );

  expect(createResponse.body.errors).toBeUndefined();

  if (isSoftDeleted) {
    const deleteResponse = await makeGraphqlApiRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: ids } },
      }),
    );

    expect(deleteResponse.body.errors).toBeUndefined();
  }

  return ids;
};

export const findTestPeople = async (ids: string[]): Promise<TestPerson[]> => {
  const people = await findRecordNodesByFilter<{
    id: string;
    jobTitle: string;
    deletedAt: string | null;
  }>('person', 'people', 'id jobTitle deletedAt', {
    and: [
      { id: { in: ids } },
      {
        or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
      },
    ],
  });

  return ids.map((id) => {
    const person = people.find((candidate) => candidate.id === id);

    if (!isDefined(person)) {
      return { status: 'absent' };
    }

    return {
      status: isDefined(person.deletedAt) ? 'softDeleted' : 'active',
      jobTitle: person.jobTitle,
    };
  });
};

export const deleteTestPeople = () =>
  deleteRecordsByIds('person', testPersonIds.splice(0));
