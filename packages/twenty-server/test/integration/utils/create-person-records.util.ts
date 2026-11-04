import { randomUUID } from 'node:crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { PERSON_RECORD_FIXTURE } from 'test/integration/utils/person-record-fixture.constant';

export const createPersonRecords = async ({
  count,
  isSoftDeleted = false,
}: {
  count: number;
  isSoftDeleted?: boolean;
}) => {
  const ids = Array.from({ length: count }, () => randomUUID());

  const createResponse = await makeGraphqlApiRequest(
    createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: ids.map((id) => ({
        id,
        name: { firstName: PERSON_RECORD_FIXTURE.firstName },
        jobTitle: PERSON_RECORD_FIXTURE.jobTitle,
      })),
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
