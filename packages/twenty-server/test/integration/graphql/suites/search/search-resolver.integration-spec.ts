import { randomUUID } from 'crypto';

import { OBJECT_MODEL_COMMON_FIELDS } from 'test/integration/constants/object-model-common-fields';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { performCreateManyOperation } from 'test/integration/graphql/utils/perform-create-many-operation.utils';
import {
  SearchFactoryParams,
  searchFactory,
} from 'test/integration/graphql/utils/search-factory.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { EachTestingContext } from 'twenty-shared/testing';

import { SearchRecordDTO } from 'src/engine/core-modules/search/dtos/search-record-dto';

describe('SearchResolver', () => {
  let listingObjectMetadataId: { objectMetadataId: string };
  const [firstPerson, secondPerson, thirdPerson] = [
    { id: randomUUID(), name: { firstName: 'searchInput1' } },
    { id: randomUUID(), name: { firstName: 'searchInput2' } },
    { id: randomUUID(), name: { firstName: 'searchInput3' } },
  ];
  const [apiKey] = [
    {
      id: randomUUID(),
      name: 'record not searchable',
      expiresAt: new Date(Date.now()),
    },
  ];
  const [firstListing, secondListing] = [
    { id: randomUUID(), name: 'searchInput1' },
    { id: randomUUID(), name: 'searchInput2' },
  ];

  const hasSearchRecord = (search: SearchRecordDTO[], recordId: string) => {
    return search.some((item: SearchRecordDTO) => item.recordId === recordId);
  };

  beforeAll(async () => {
    try {
      const objectsMetadata = await findManyObjectMetadata({
        input: {
          filter: {},
          paging: {
            first: 1000,
          },
        },
      });

      const listingObjectMetadata = objectsMetadata.find(
        (object) => object.nameSingular === LISTING_NAME_SINGULAR,
      );

      if (listingObjectMetadata) {
        listingObjectMetadataId = {
          objectMetadataId: listingObjectMetadata.id,
        };
      } else {
        const { data } = await createOneObjectMetadata({
          input: {
            labelSingular: LISTING_NAME_SINGULAR,
            labelPlural: LISTING_NAME_PLURAL,
            nameSingular: LISTING_NAME_SINGULAR,
            namePlural: LISTING_NAME_PLURAL,
            icon: 'IconBuildingSkyscraper',
          },
        });

        listingObjectMetadataId = {
          objectMetadataId: data.createOneObject.id,
        };
      }

      await performCreateManyOperation(
        LISTING_NAME_SINGULAR,
        LISTING_NAME_PLURAL,
        OBJECT_MODEL_COMMON_FIELDS,
        [firstListing, secondListing],
      );

      await performCreateManyOperation('person', 'people', PERSON_GQL_FIELDS, [
        firstPerson,
        secondPerson,
        thirdPerson,
      ]);

      await performCreateManyOperation(
        'apiKey',
        'apiKeys',
        OBJECT_MODEL_COMMON_FIELDS,
        [apiKey],
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      throw new Error('beforeAll failed');
    }
  });

  afterAll(async () => {
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [firstPerson.id, secondPerson.id, thirdPerson.id],
          },
        },
      }),
    ).catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: listingObjectMetadataId.objectMetadataId },
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });

    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'apiKey',
        gqlFields: OBJECT_MODEL_COMMON_FIELDS,
        recordId: apiKey.id,
      }),
    ).catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
  });

  const testsUseCases: EachTestingContext<{
    input: SearchFactoryParams;
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
          definedRecordIds: [firstListing.id, secondListing.id],
          undefinedRecordIds: [apiKey.id],
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
          definedRecordIds: [firstPerson.id, firstListing.id],
          undefinedRecordIds: [secondPerson.id, secondListing.id],
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
          definedRecordIds: [firstListing.id, secondListing.id],
          undefinedRecordIds: [firstPerson.id, secondPerson.id],
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
          definedRecordIds: [firstListing.id, secondListing.id],
          undefinedRecordIds: [firstPerson.id, secondPerson.id],
        },
      },
    },
    {
      title: 'should return filtered records when filter is provided',
      context: {
        input: {
          searchInput: '',
          filter: {
            id: { eq: firstListing.id },
          },
        },
        eval: {
          definedRecordIds: [firstListing.id],
          undefinedRecordIds: [secondListing.id],
        },
      },
    },
  ];

  it.each(testsUseCases)('$title', async ({ context }) => {
    const graphqlOperation = searchFactory(context.input);
    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.search).toBeDefined();

    const search = response.body.data.search;

    context.eval.definedRecordIds.length > 0
      ? expect(search).not.toHaveLength(0)
      : expect(search).toHaveLength(0);

    context.eval.definedRecordIds.forEach((recordId) => {
      expect(hasSearchRecord(search, recordId)).toBeTruthy();
    });

    context.eval.undefinedRecordIds.forEach((recordId) => {
      expect(hasSearchRecord(search, recordId)).toBeFalsy();
    });
  });
});
