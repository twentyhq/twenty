import { randomUUID } from 'crypto';

import { CUSTOM_OR_STANDARD_OBJECT_GQL_BASIC_FIELDS } from 'test/integration/constants/custom-or-standard-object-gql-generic-fields.contants';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { globalSearchFactory } from 'test/integration/graphql/utils/global-search-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  createListingCustomObject,
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/utils/create-test-object-metadata.util';
import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GlobalSearchRecordDTO } from 'src/engine/core-modules/global-search/dtos/global-search-record-dto';

describe('GlobalSearchResolver', () => {
  let listingObjectMetadataId: { objectMetadataId: string };
  let people: ObjectRecord[];
  let listings: ObjectRecord[];
  let apiKey: ObjectRecord;

  const getSearchRecord = (
    globalSearch: GlobalSearchRecordDTO[],
    recordId: string,
  ) => {
    return globalSearch.find(
      (item: GlobalSearchRecordDTO) => item.recordId === recordId,
    );
  };

  beforeAll(async () => {
    listingObjectMetadataId = await createListingCustomObject();
    listings = (
      await makeGraphqlAPIRequest(
        createManyOperationFactory({
          objectMetadataSingularName: LISTING_NAME_SINGULAR,
          objectMetadataPluralName: LISTING_NAME_PLURAL,
          gqlFields: CUSTOM_OR_STANDARD_OBJECT_GQL_BASIC_FIELDS,
          data: [
            {
              id: randomUUID(),
              name: 'searchInput1',
            },
            {
              id: randomUUID(),
              name: 'searchInput2',
            },
          ],
        }),
      )
    ).body.data.createListings;

    people = (
      await makeGraphqlAPIRequest(
        createManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          data: [
            {
              id: randomUUID(),
              name: {
                firstName: 'searchInput1',
                lastName: '',
              },
            },
            {
              id: randomUUID(),
              name: {
                firstName: 'searchInput2',
                lastName: '',
              },
            },
            {
              id: randomUUID(),
              name: {
                firstName: 'searchInput3',
                lastName: '',
              },
            },
          ],
        }),
      )
    ).body.data.createPeople;

    apiKey = (
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'apiKey',
          gqlFields: CUSTOM_OR_STANDARD_OBJECT_GQL_BASIC_FIELDS,
          data: {
            id: randomUUID(),
            name: 'record not searchable',
            expiresAt: new Date(Date.now()),
          },
        }),
      )
    ).body.data.createApiKey;
  });

  afterAll(async () => {
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: people.map((person) => person.id),
          },
        },
      }),
    );

    await deleteOneObjectMetadataItem(listingObjectMetadataId.objectMetadataId);

    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'apiKey',
        gqlFields: CUSTOM_OR_STANDARD_OBJECT_GQL_BASIC_FIELDS,
        recordId: apiKey.id,
      }),
    );
  });

  it("should return all records for 'isSearchable:true' objects when no search input is provided", async () => {
    const graphqlOperation = globalSearchFactory({
      searchInput: '',
    });
    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.globalSearch).toBeDefined();

    const globalSearch = response.body.data.globalSearch;

    expect(globalSearch).not.toHaveLength(0);
    expect(getSearchRecord(globalSearch, listings[0].id)).toBeDefined();
    expect(getSearchRecord(globalSearch, listings[1].id)).toBeDefined();
    expect(getSearchRecord(globalSearch, apiKey.id)).toBeUndefined();
  });

  it('should return filtered records when search input is provided', async () => {
    const graphqlOperation = globalSearchFactory({
      searchInput: 'searchInput1',
    });
    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.globalSearch).toBeDefined();

    const globalSearch = response.body.data.globalSearch;

    expect(globalSearch).not.toHaveLength(0);
    expect(getSearchRecord(globalSearch, people[0].id)).toBeDefined();
    expect(getSearchRecord(globalSearch, people[1].id)).toBeUndefined();
    expect(getSearchRecord(globalSearch, listings[0].id)).toBeDefined();
    expect(getSearchRecord(globalSearch, listings[1].id)).toBeUndefined();
  });

  it('should return record from included Objects only', async () => {
    const graphqlOperation = globalSearchFactory({
      searchInput: '',
      includedObjectNameSingulars: [LISTING_NAME_SINGULAR],
    });
    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.globalSearch).toBeDefined();

    const globalSearch = response.body.data.globalSearch;

    expect(globalSearch).not.toHaveLength(0);
    expect(getSearchRecord(globalSearch, people[0].id)).toBeUndefined();
    expect(getSearchRecord(globalSearch, listings[0].id)).toBeDefined();
    expect(getSearchRecord(globalSearch, listings[1].id)).toBeDefined();
  });

  it('should not return record from excludedObject', async () => {
    const graphqlOperation = globalSearchFactory({
      searchInput: '',
      excludedObjectNameSingulars: ['person'],
    });
    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.globalSearch).toBeDefined();

    const globalSearch = response.body.data.globalSearch;

    expect(globalSearch).not.toHaveLength(0);
    expect(getSearchRecord(globalSearch, people[0].id)).toBeUndefined();
    expect(getSearchRecord(globalSearch, listings[0].id)).toBeDefined();
    expect(getSearchRecord(globalSearch, listings[1].id)).toBeDefined();
  });

  it('should return filtered records when filter is provided', async () => {
    const graphqlOperation = globalSearchFactory({
      searchInput: '',
      filter: {
        id: {
          eq: listings[0].id,
        },
      },
    });
    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.globalSearch).toBeDefined();

    const globalSearch = response.body.data.globalSearch;

    expect(globalSearch).not.toHaveLength(0);
    expect(getSearchRecord(globalSearch, people[0].id)).toBeUndefined();
    expect(getSearchRecord(globalSearch, listings[0].id)).toBeDefined();
    expect(getSearchRecord(globalSearch, listings[1].id)).toBeUndefined();
  });

  it('should not return any record when search input matches no record', async () => {
    const graphqlOperation = globalSearchFactory({
      searchInput: 'noMatchingAnyRecordSearchInput',
    });
    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.globalSearch).toBeDefined();

    const globalSearch = response.body.data.globalSearch;

    expect(globalSearch).toHaveLength(0);
  });
});
