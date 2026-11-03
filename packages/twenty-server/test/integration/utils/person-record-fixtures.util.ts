import { randomUUID } from 'node:crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { isDefined } from 'twenty-shared/utils';

export const PERSON_RECORD_SEEDED_JOB_TITLE = 'Seeded job title';

export type PersonRecordState = {
  status: 'active' | 'softDeleted' | 'absent';
  jobTitle?: string;
};

const personRecordIds: string[] = [];

export const reservePersonRecordIds = (count: number) => {
  const ids = Array.from({ length: count }, () => randomUUID());

  personRecordIds.push(...ids);

  return ids;
};

export const createPersonRecords = async ({
  count,
  isSoftDeleted = false,
}: {
  count: number;
  isSoftDeleted?: boolean;
}) => {
  const ids = reservePersonRecordIds(count);

  const createResponse = await makeGraphqlApiRequest(
    createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: ids.map((id) => ({ id, jobTitle: PERSON_RECORD_SEEDED_JOB_TITLE })),
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

export const findPersonRecordStates = async (
  ids: string[],
): Promise<PersonRecordState[]> => {
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

export const deletePersonRecords = () =>
  deleteRecordsByIds('person', personRecordIds.splice(0));
