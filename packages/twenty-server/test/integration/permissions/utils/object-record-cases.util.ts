import { randomUUID } from 'node:crypto';

import { type Response } from 'supertest';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  expectPermissionDenied,
  expectRestPermissionDenied,
} from 'test/integration/permissions/utils/expect-permission-denied.util';
import {
  getSharedTestPrincipal,
  type TestPrincipalKind,
} from 'test/integration/permissions/utils/get-shared-test-principal.util';
import {
  OBJECT_RECORD_OPERATIONS,
  type ObjectRecordApi,
  type ObjectRecordOperationName,
  type PersonRecordStatus,
  SEEDED_JOB_TITLE,
} from 'test/integration/permissions/utils/object-record-operations.constant';
import { type SharedTestRoleKey } from 'test/integration/permissions/utils/shared-test-roles.constant';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { isDefined } from 'twenty-shared/utils';

export type ObjectRecordCase = {
  operation: ObjectRecordOperationName;
  api: ObjectRecordApi;
  principalKind: TestPrincipalKind;
  roleKey: SharedTestRoleKey;
  expectation: 'allowed' | 'denied';
  recordIds: string[];
};

type PersonRecordState = {
  status: PersonRecordStatus;
  jobTitle?: string;
};

export const buildObjectRecordCase = (
  objectRecordCase: Omit<ObjectRecordCase, 'recordIds'>,
): ObjectRecordCase => ({
  ...objectRecordCase,
  recordIds: Array.from(
    {
      length: OBJECT_RECORD_OPERATIONS[objectRecordCase.operation].recordCount,
    },
    () => randomUUID(),
  ),
});

const getRecordIdsSeededAs = (
  objectRecordCases: ObjectRecordCase[],
  status: PersonRecordStatus,
) =>
  objectRecordCases
    .filter(
      (objectRecordCase) =>
        OBJECT_RECORD_OPERATIONS[objectRecordCase.operation].seededStatus ===
        status,
    )
    .flatMap((objectRecordCase) => objectRecordCase.recordIds);

export const seedObjectRecordCases = async (
  objectRecordCases: ObjectRecordCase[],
) => {
  const softDeletedRecordIds = getRecordIdsSeededAs(
    objectRecordCases,
    'softDeleted',
  );
  const seededRecordIds = [
    ...getRecordIdsSeededAs(objectRecordCases, 'active'),
    ...softDeletedRecordIds,
  ];

  const createResponse = await makeGraphqlApiRequest(
    createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: seededRecordIds.map((id) => ({ id, jobTitle: SEEDED_JOB_TITLE })),
    }),
  );

  expect(createResponse.body.errors).toBeUndefined();

  if (softDeletedRecordIds.length === 0) {
    return;
  }

  const deleteResponse = await makeGraphqlApiRequest(
    deleteManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      filter: { id: { in: softDeletedRecordIds } },
    }),
  );

  expect(deleteResponse.body.errors).toBeUndefined();
};

export const cleanUpObjectRecordCases = (
  objectRecordCases: ObjectRecordCase[],
) =>
  deleteRecordsByIds(
    'person',
    objectRecordCases.flatMap((objectRecordCase) => objectRecordCase.recordIds),
  );

const readPersonRecordStates = async (
  recordIds: string[],
): Promise<PersonRecordState[]> => {
  const people = await findRecordNodesByFilter<{
    id: string;
    jobTitle: string;
    deletedAt: string | null;
  }>('person', 'people', 'id jobTitle deletedAt', {
    and: [
      { id: { in: recordIds } },
      {
        or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
      },
    ],
  });

  return recordIds.map((recordId) => {
    const person = people.find(({ id }) => id === recordId);

    if (!isDefined(person)) {
      return { status: 'absent' };
    }

    return {
      status: isDefined(person.deletedAt) ? 'softDeleted' : 'active',
      jobTitle: person.jobTitle,
    };
  });
};

const toExpectedState = ({
  status,
  jobTitle,
}: {
  status: PersonRecordStatus;
  jobTitle: string;
}): PersonRecordState =>
  status === 'absent' ? { status } : { status, jobTitle };

const expectAllowedResponse = (api: ObjectRecordApi, response: Response) => {
  if (api === 'graphql') {
    expect(response.body.errors).toBeUndefined();

    return;
  }

  expect([200, 201]).toContain(response.status);
};

const expectDeniedResponse = (api: ObjectRecordApi, response: Response) => {
  if (api === 'graphql') {
    expectPermissionDenied(response.body.errors);

    return;
  }

  expectRestPermissionDenied(response);
};

// Asserts the record state as well as the response, so a denied call that
// still wrote, or an allowed call that silently did nothing, fails.
export const expectObjectRecordCase = async ({
  operation: operationName,
  api,
  principalKind,
  roleKey,
  expectation,
  recordIds,
}: ObjectRecordCase) => {
  const operation = OBJECT_RECORD_OPERATIONS[operationName];
  const principal = await getSharedTestPrincipal({
    kind: principalKind,
    roleKey,
  });

  const response = await operation.run[api]({ principal, recordIds });

  if (expectation === 'denied') {
    expectDeniedResponse(api, response);
  } else {
    expectAllowedResponse(api, response);
  }

  if (expectation === 'allowed' && isDefined(operation.readReturnedRecordIds)) {
    expect(operation.readReturnedRecordIds[api](response)).toHaveLength(
      recordIds.length,
    );
    expect(operation.readReturnedRecordIds[api](response)).toEqual(
      expect.arrayContaining(recordIds),
    );
  }

  const expectedState =
    expectation === 'allowed'
      ? toExpectedState({
          status: operation.statusAfterSuccess,
          jobTitle: operation.jobTitleAfterSuccess,
        })
      : toExpectedState({
          status: operation.seededStatus,
          jobTitle: SEEDED_JOB_TITLE,
        });

  expect(await readPersonRecordStates(recordIds)).toStrictEqual(
    recordIds.map(() => expectedState),
  );
};
