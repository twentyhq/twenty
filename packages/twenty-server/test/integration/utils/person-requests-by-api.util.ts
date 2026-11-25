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

export type RecordApi = 'graphql' | 'rest';

type PersonData = {
  id: string;
  companyId?: string;
  name?: { firstName: string };
  jobTitle?: string;
  intro?: string;
};

type PersonRequestInput = { api: RecordApi; token: string };

type GraphqlSelectionInput = { gqlFields?: string };

const PERSON_SINGULAR_NAME = 'person';
const PERSON_PLURAL_NAME = 'people';
const PERSON_FIELDS = 'id jobTitle';

const restIdFilter = (ids: string[]) =>
  `filter=id[in]:[${ids.map((id) => `"${id}"`).join(',')}]`;

export const personRequestsByApi = {
  findMany: ({
    api,
    token,
    ids,
    gqlFields = PERSON_FIELDS,
  }: PersonRequestInput & GraphqlSelectionInput & { ids: string[] }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          objectMetadataPluralName: PERSON_PLURAL_NAME,
          gqlFields,
          filter: { id: { in: ids } },
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'get',
      path: `/${PERSON_PLURAL_NAME}?${restIdFilter(ids)}`,
      bearer: token,
    });
  },

  findOne: ({
    api,
    token,
    id,
    gqlFields = PERSON_FIELDS,
  }: PersonRequestInput & GraphqlSelectionInput & { id: string }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        findOneOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          gqlFields,
          filter: { id: { eq: id } },
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'get',
      path: `/${PERSON_PLURAL_NAME}/${id}`,
      bearer: token,
    });
  },

  createOne: ({
    api,
    token,
    data,
  }: PersonRequestInput & { data: PersonData }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          gqlFields: PERSON_FIELDS,
          data,
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'post',
      path: `/${PERSON_PLURAL_NAME}`,
      body: data,
      bearer: token,
    });
  },

  createMany: ({
    api,
    token,
    data,
  }: PersonRequestInput & { data: PersonData[] }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        createManyOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          objectMetadataPluralName: PERSON_PLURAL_NAME,
          gqlFields: PERSON_FIELDS,
          data,
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'post',
      path: `/batch/${PERSON_PLURAL_NAME}`,
      body: data,
      bearer: token,
    });
  },

  updateOne: ({
    api,
    token,
    id,
    data,
    gqlFields = PERSON_FIELDS,
  }: PersonRequestInput &
    GraphqlSelectionInput & { id: string; data: Omit<PersonData, 'id'> }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          gqlFields,
          recordId: id,
          data,
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'patch',
      path: `/${PERSON_PLURAL_NAME}/${id}`,
      body: data,
      bearer: token,
    });
  },

  updateMany: ({
    api,
    token,
    ids,
    data,
    gqlFields = PERSON_FIELDS,
  }: PersonRequestInput &
    GraphqlSelectionInput & {
      ids: string[];
      data: Omit<PersonData, 'id'>;
    }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        updateManyOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          objectMetadataPluralName: PERSON_PLURAL_NAME,
          gqlFields,
          filter: { id: { in: ids } },
          data,
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'patch',
      path: `/${PERSON_PLURAL_NAME}?${restIdFilter(ids)}`,
      body: data,
      bearer: token,
    });
  },

  deleteOne: ({ api, token, id }: PersonRequestInput & { id: string }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          gqlFields: PERSON_FIELDS,
          recordId: id,
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'delete',
      path: `/${PERSON_PLURAL_NAME}/${id}?soft_delete=true`,
      bearer: token,
    });
  },

  deleteMany: ({ api, token, ids }: PersonRequestInput & { ids: string[] }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        deleteManyOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          objectMetadataPluralName: PERSON_PLURAL_NAME,
          gqlFields: PERSON_FIELDS,
          filter: { id: { in: ids } },
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'delete',
      path: `/${PERSON_PLURAL_NAME}?${restIdFilter(ids)}&soft_delete=true`,
      bearer: token,
    });
  },

  restoreOne: ({ api, token, id }: PersonRequestInput & { id: string }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        restoreOneOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          gqlFields: PERSON_FIELDS,
          recordId: id,
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'patch',
      path: `/${PERSON_PLURAL_NAME}/${id}/restore`,
      bearer: token,
    });
  },

  restoreMany: ({
    api,
    token,
    ids,
  }: PersonRequestInput & { ids: string[] }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        restoreManyOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          objectMetadataPluralName: PERSON_PLURAL_NAME,
          gqlFields: PERSON_FIELDS,
          filter: { id: { in: ids } },
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'patch',
      path: `/${PERSON_PLURAL_NAME}/restore?${restIdFilter(ids)}`,
      bearer: token,
    });
  },

  destroyOne: ({ api, token, id }: PersonRequestInput & { id: string }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          gqlFields: PERSON_FIELDS,
          recordId: id,
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'delete',
      path: `/${PERSON_PLURAL_NAME}/${id}`,
      bearer: token,
    });
  },

  destroyMany: ({
    api,
    token,
    ids,
  }: PersonRequestInput & { ids: string[] }) => {
    if (api === 'graphql') {
      return makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: PERSON_SINGULAR_NAME,
          objectMetadataPluralName: PERSON_PLURAL_NAME,
          gqlFields: PERSON_FIELDS,
          filter: { id: { in: ids } },
        }),
        token,
      );
    }

    return makeRestApiRequest({
      method: 'delete',
      path: `/${PERSON_PLURAL_NAME}?${restIdFilter(ids)}`,
      bearer: token,
    });
  },
};
