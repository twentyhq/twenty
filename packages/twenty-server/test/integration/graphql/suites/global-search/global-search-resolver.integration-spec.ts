import { randomUUID } from 'crypto';

import { OBJECT_MODEL_COMMON_FIELDS } from 'test/integration/constants/object-model-common-fields';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import {
  globalSearchFactory,
  GlobalSearchFactoryParams,
} from 'test/integration/graphql/utils/global-search-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { performCreateManyOperation } from 'test/integration/graphql/utils/perform-create-many-operation.utils';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { createListingCustomObject } from 'test/integration/metadata/suites/object-metadata/utils/create-test-object-metadata.util';
import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectsMetadataItems } from 'test/integration/metadata/suites/object-metadata/utils/find-many-objects-metadata-items.util';
import { EachTestingContext } from 'twenty-shared';

import { GlobalSearchRecordDTO } from 'src/engine/core-modules/global-search/dtos/global-search-record-dto';

describe('GlobalSearchResolver', () => {
  let listingObjectMetadataId: { objectMetadataId: string };
  const people = [
    { id: randomUUID(), name: { firstName: 'searchInput1' } },
    { id: randomUUID(), name: { firstName: 'searchInput2' } },
    { id: randomUUID(), name: { firstName: 'searchInput3' } },
  ];
  const apiKeys = [
    {
      id: randomUUID(),
      name: 'record not searchable',
      expiresAt: new Date(Date.now()),
    },
  ];
  const listings = [
    { id: randomUUID(), name: 'searchInput1' },
    { id: randomUUID(), name: 'searchInput2' },
  ];

  const getSearchRecord = (
    globalSearch: GlobalSearchRecordDTO[],
    recordId: string,
  ) => {
    return globalSearch.find(
      (item: GlobalSearchRecordDTO) => item.recordId === recordId,
    );
  };

  beforeAll(async () => {
    const objectsMetadata = await findManyObjectsMetadataItems();
    const listingObjectMetadata = objectsMetadata.find(
      (object) => object.nameSingular === LISTING_NAME_SINGULAR,
    );

    if (listingObjectMetadata) {
      listingObjectMetadataId = { objectMetadataId: listingObjectMetadata.id };
    } else {
      listingObjectMetadataId = await createListingCustomObject();
    }

    await performCreateManyOperation(
      LISTING_NAME_SINGULAR,
      LISTING_NAME_PLURAL,
      OBJECT_MODEL_COMMON_FIELDS,
      listings,
    );

    await performCreateManyOperation(
      'person',
      'people',
      PERSON_GQL_FIELDS,
      people,
    );

    await performCreateManyOperation(
      'apiKey',
      'apiKeys',
      OBJECT_MODEL_COMMON_FIELDS,
      apiKeys,
    );
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
        gqlFields: OBJECT_MODEL_COMMON_FIELDS,
        recordId: apiKeys[0].id,
      }),
    );
  });

  const testsUseCases: EachTestingContext<{
    input: GlobalSearchFactoryParams;
    eval: {
      definedRecordIds: string[];
      undefinedRecordIds: string[];
    };
  }>[] = [
    {
      title:
        'should return all records for "isSearchable:true" objects when no search input is provided',
      context: {
        input: {
          searchInput: '',
        },
        eval: {
          definedRecordIds: [listings[0].id, listings[1].id],
          undefinedRecordIds: [apiKeys[0].id],
        },
      },
    },
    {
      title: 'should return filtered records when search input is provided',
      context: {
        input: {
          searchInput: 'searchInput1',
        },
        eval: {
          definedRecordIds: [people[0].id, listings[0].id],
          undefinedRecordIds: [people[1].id, listings[1].id],
        },
      },
    },
    {
      title: 'should return record from included Objects only',
      context: {
        input: {
          searchInput: '',
          includedObjectNameSingulars: [LISTING_NAME_SINGULAR],
        },
        eval: {
          definedRecordIds: [listings[0].id, listings[1].id],
          undefinedRecordIds: [people[0].id, people[1].id],
        },
      },
    },
    {
      title: 'should not return record from excludedObject',
      context: {
        input: {
          searchInput: '',
          excludedObjectNameSingulars: ['person'],
        },
        eval: {
          definedRecordIds: [listings[0].id, listings[1].id],
          undefinedRecordIds: [people[0].id, people[1].id],
        },
      },
    },
    {
      title: 'should return filtered records when filter is provided',
      context: {
        input: {
          searchInput: '',
          filter: {
            id: { eq: listings[0].id },
          },
        },
        eval: {
          definedRecordIds: [listings[0].id],
          undefinedRecordIds: [listings[1].id],
        },
      },
    },
  ];

  it.each(testsUseCases)('$title', async ({ context }) => {
    const graphqlOperation = globalSearchFactory(context.input);
    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.globalSearch).toBeDefined();

    const globalSearch = response.body.data.globalSearch;

    context.eval.definedRecordIds.length > 0
      ? expect(globalSearch).not.toHaveLength(0)
      : expect(globalSearch).toHaveLength(0);

    context.eval.definedRecordIds.forEach((recordId) => {
      expect(getSearchRecord(globalSearch, recordId)).toBeDefined();
    });

    context.eval.undefinedRecordIds.forEach((recordId) => {
      expect(getSearchRecord(globalSearch, recordId)).toBeUndefined();
    });
  });
});
