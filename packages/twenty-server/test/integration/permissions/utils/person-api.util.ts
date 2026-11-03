import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

export type Api = 'graphql' | 'rest';

type PersonData = { id: string; jobTitle?: string };

const PERSON_FIELDS = 'id jobTitle';

const PERSON_NAMES = {
  objectMetadataSingularName: 'person',
  objectMetadataPluralName: 'people',
};

const restIdFilter = (ids: string[]) =>
  `filter=id[in]:[${ids.map((id) => `"${id}"`).join(',')}]`;

// Each call sends the same operation through GraphQL or REST, so a spec can
// run one assertion against both APIs.
export const personApi = {
  findMany: ({
    api,
    token,
    ids,
  }: {
    api: Api;
    token: string;
    ids: string[];
  }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          findManyOperationFactory({
            ...PERSON_NAMES,
            gqlFields: PERSON_FIELDS,
            filter: { id: { in: ids } },
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'get',
          path: `/people?${restIdFilter(ids)}`,
          bearer: token,
        }),

  findOne: ({ api, token, id }: { api: Api; token: string; id: string }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          findOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            filter: { id: { eq: id } },
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'get',
          path: `/people/${id}`,
          bearer: token,
        }),

  createOne: ({
    api,
    token,
    data,
  }: {
    api: Api;
    token: string;
    data: PersonData;
  }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            data,
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'post',
          path: '/people',
          body: data,
          bearer: token,
        }),

  createMany: ({
    api,
    token,
    data,
  }: {
    api: Api;
    token: string;
    data: PersonData[];
  }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          createManyOperationFactory({
            ...PERSON_NAMES,
            gqlFields: PERSON_FIELDS,
            data,
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'post',
          path: '/batch/people',
          body: data,
          bearer: token,
        }),

  updateOne: ({
    api,
    token,
    id,
    data,
  }: {
    api: Api;
    token: string;
    id: string;
    data: Omit<PersonData, 'id'>;
  }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          updateOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            recordId: id,
            data,
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'patch',
          path: `/people/${id}`,
          body: data,
          bearer: token,
        }),

  updateMany: ({
    api,
    token,
    ids,
    data,
  }: {
    api: Api;
    token: string;
    ids: string[];
    data: Omit<PersonData, 'id'>;
  }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          updateManyOperationFactory({
            ...PERSON_NAMES,
            gqlFields: PERSON_FIELDS,
            filter: { id: { in: ids } },
            data,
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'patch',
          path: `/people?${restIdFilter(ids)}`,
          body: data,
          bearer: token,
        }),

  deleteOne: ({ api, token, id }: { api: Api; token: string; id: string }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          deleteOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            recordId: id,
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'delete',
          path: `/people/${id}?soft_delete=true`,
          bearer: token,
        }),

  deleteMany: ({
    api,
    token,
    ids,
  }: {
    api: Api;
    token: string;
    ids: string[];
  }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          deleteManyOperationFactory({
            ...PERSON_NAMES,
            gqlFields: PERSON_FIELDS,
            filter: { id: { in: ids } },
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'delete',
          path: `/people?${restIdFilter(ids)}&soft_delete=true`,
          bearer: token,
        }),

  restoreOne: ({ api, token, id }: { api: Api; token: string; id: string }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          restoreOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            recordId: id,
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'patch',
          path: `/people/${id}/restore`,
          bearer: token,
        }),

  restoreMany: ({
    api,
    token,
    ids,
  }: {
    api: Api;
    token: string;
    ids: string[];
  }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          restoreManyOperationFactory({
            ...PERSON_NAMES,
            gqlFields: PERSON_FIELDS,
            filter: { id: { in: ids } },
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'patch',
          path: `/people/restore?${restIdFilter(ids)}`,
          bearer: token,
        }),

  destroyOne: ({ api, token, id }: { api: Api; token: string; id: string }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_FIELDS,
            recordId: id,
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'delete',
          path: `/people/${id}`,
          bearer: token,
        }),

  destroyMany: ({
    api,
    token,
    ids,
  }: {
    api: Api;
    token: string;
    ids: string[];
  }) =>
    api === 'graphql'
      ? makeGraphqlApiRequest(
          destroyManyOperationFactory({
            ...PERSON_NAMES,
            gqlFields: PERSON_FIELDS,
            filter: { id: { in: ids } },
          }),
          token,
        )
      : makeRestApiRequest({
          method: 'delete',
          path: `/people?${restIdFilter(ids)}`,
          bearer: token,
        }),
};
