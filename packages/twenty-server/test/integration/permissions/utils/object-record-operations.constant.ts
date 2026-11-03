import { type Response, type Test } from 'supertest';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { type TestPrincipal } from 'test/integration/permissions/utils/get-shared-test-principal.util';

export type ObjectRecordGrant = 'read' | 'update' | 'softDelete' | 'destroy';

export type ObjectRecordApi = 'graphql' | 'rest';

export type PersonRecordStatus = 'active' | 'softDeleted' | 'absent';

export const SEEDED_JOB_TITLE = 'Seeded by a permission spec';

export const UPDATED_JOB_TITLE = 'Updated by a permission spec';

type OperationRunInput = {
  principal: TestPrincipal;
  recordIds: string[];
};

type ObjectRecordOperation = {
  requiredGrant: ObjectRecordGrant;
  recordCount: number;
  seededStatus: PersonRecordStatus;
  statusAfterSuccess: PersonRecordStatus;
  jobTitleAfterSuccess: string;
  run: Record<ObjectRecordApi, (input: OperationRunInput) => Test>;
  readReturnedRecordIds?: Record<
    ObjectRecordApi,
    (response: Response) => string[]
  >;
};

export type ObjectRecordOperationName =
  | 'findMany'
  | 'findOne'
  | 'createOne'
  | 'createMany'
  | 'updateOne'
  | 'updateMany'
  | 'deleteOne'
  | 'deleteMany'
  | 'restoreOne'
  | 'restoreMany'
  | 'destroyOne'
  | 'destroyMany';

const PERSON_FIELDS = 'id jobTitle';

const idInFilter = (recordIds: string[]) => ({ id: { in: recordIds } });

const restIdInFilter = (recordIds: string[]) =>
  `filter=id[in]:[${recordIds.map((recordId) => `"${recordId}"`).join(',')}]`;

export const OBJECT_RECORD_OPERATIONS: Record<
  ObjectRecordOperationName,
  ObjectRecordOperation
> = {
  findMany: {
    requiredGrant: 'read',
    recordCount: 2,
    seededStatus: 'active',
    statusAfterSuccess: 'active',
    jobTitleAfterSuccess: SEEDED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          findManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: PERSON_FIELDS,
            filter: idInFilter(recordIds),
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({
          method: 'get',
          path: `/people?${restIdInFilter(recordIds)}`,
        }),
    },
    readReturnedRecordIds: {
      graphql: (response) =>
        response.body.data.people.edges.map(
          (edge: { node: { id: string } }) => edge.node.id,
        ),
      rest: (response) =>
        response.body.data.people.map((person: { id: string }) => person.id),
    },
  },
  findOne: {
    requiredGrant: 'read',
    recordCount: 1,
    seededStatus: 'active',
    statusAfterSuccess: 'active',
    jobTitleAfterSuccess: SEEDED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          findOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            filter: { id: { eq: recordIds[0] } },
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({ method: 'get', path: `/people/${recordIds[0]}` }),
    },
    readReturnedRecordIds: {
      graphql: (response) => [response.body.data.person.id],
      rest: (response) => [response.body.data.person.id],
    },
  },
  createOne: {
    requiredGrant: 'update',
    recordCount: 1,
    seededStatus: 'absent',
    statusAfterSuccess: 'active',
    jobTitleAfterSuccess: SEEDED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            data: { id: recordIds[0], jobTitle: SEEDED_JOB_TITLE },
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({
          method: 'post',
          path: '/people',
          body: { id: recordIds[0], jobTitle: SEEDED_JOB_TITLE },
        }),
    },
  },
  createMany: {
    requiredGrant: 'update',
    recordCount: 2,
    seededStatus: 'absent',
    statusAfterSuccess: 'active',
    jobTitleAfterSuccess: SEEDED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          createManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: PERSON_FIELDS,
            data: recordIds.map((id) => ({ id, jobTitle: SEEDED_JOB_TITLE })),
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({
          method: 'post',
          path: '/batch/people',
          body: recordIds.map((id) => ({ id, jobTitle: SEEDED_JOB_TITLE })),
        }),
    },
  },
  updateOne: {
    requiredGrant: 'update',
    recordCount: 1,
    seededStatus: 'active',
    statusAfterSuccess: 'active',
    jobTitleAfterSuccess: UPDATED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          updateOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            recordId: recordIds[0],
            data: { jobTitle: UPDATED_JOB_TITLE },
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({
          method: 'patch',
          path: `/people/${recordIds[0]}`,
          body: { jobTitle: UPDATED_JOB_TITLE },
        }),
    },
  },
  updateMany: {
    requiredGrant: 'update',
    recordCount: 2,
    seededStatus: 'active',
    statusAfterSuccess: 'active',
    jobTitleAfterSuccess: UPDATED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          updateManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: PERSON_FIELDS,
            filter: idInFilter(recordIds),
            data: { jobTitle: UPDATED_JOB_TITLE },
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({
          method: 'patch',
          path: `/people?${restIdInFilter(recordIds)}`,
          body: { jobTitle: UPDATED_JOB_TITLE },
        }),
    },
  },
  deleteOne: {
    requiredGrant: 'softDelete',
    recordCount: 1,
    seededStatus: 'active',
    statusAfterSuccess: 'softDeleted',
    jobTitleAfterSuccess: SEEDED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          deleteOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            recordId: recordIds[0],
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({
          method: 'delete',
          path: `/people/${recordIds[0]}?soft_delete=true`,
        }),
    },
  },
  deleteMany: {
    requiredGrant: 'softDelete',
    recordCount: 2,
    seededStatus: 'active',
    statusAfterSuccess: 'softDeleted',
    jobTitleAfterSuccess: SEEDED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          deleteManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: PERSON_FIELDS,
            filter: idInFilter(recordIds),
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({
          method: 'delete',
          path: `/people?${restIdInFilter(recordIds)}&soft_delete=true`,
        }),
    },
  },
  restoreOne: {
    requiredGrant: 'softDelete',
    recordCount: 1,
    seededStatus: 'softDeleted',
    statusAfterSuccess: 'active',
    jobTitleAfterSuccess: SEEDED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          restoreOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            recordId: recordIds[0],
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({
          method: 'patch',
          path: `/people/${recordIds[0]}/restore`,
        }),
    },
  },
  restoreMany: {
    requiredGrant: 'softDelete',
    recordCount: 2,
    seededStatus: 'softDeleted',
    statusAfterSuccess: 'active',
    jobTitleAfterSuccess: SEEDED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          restoreManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: PERSON_FIELDS,
            filter: idInFilter(recordIds),
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({
          method: 'patch',
          path: `/people/restore?${restIdInFilter(recordIds)}`,
        }),
    },
  },
  destroyOne: {
    requiredGrant: 'destroy',
    recordCount: 1,
    seededStatus: 'active',
    statusAfterSuccess: 'absent',
    jobTitleAfterSuccess: SEEDED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            recordId: recordIds[0],
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({ method: 'delete', path: `/people/${recordIds[0]}` }),
    },
  },
  destroyMany: {
    requiredGrant: 'destroy',
    recordCount: 2,
    seededStatus: 'active',
    statusAfterSuccess: 'absent',
    jobTitleAfterSuccess: SEEDED_JOB_TITLE,
    run: {
      graphql: ({ principal, recordIds }) =>
        principal.graphql(
          destroyManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: PERSON_FIELDS,
            filter: idInFilter(recordIds),
          }),
        ),
      rest: ({ principal, recordIds }) =>
        principal.rest({
          method: 'delete',
          path: `/people?${restIdInFilter(recordIds)}`,
        }),
    },
  },
};
