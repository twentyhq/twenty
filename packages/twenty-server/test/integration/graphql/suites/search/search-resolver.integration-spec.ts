import { OBJECT_MODEL_COMMON_FIELDS } from 'test/integration/constants/object-model-common-fields';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { performCreateManyOperation } from 'test/integration/graphql/utils/perform-create-many-operation.utils';
import { searchFactory } from 'test/integration/graphql/utils/search-factory.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { EachTestingContext } from 'twenty-shared/testing';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
  TEST_PERSON_3_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { TEST_API_KEY_1_ID } from 'test/integration/constants/test-api-key-ids.constant';
import {
  TEST_LISTING_ID_1,
  TEST_LISTING_ID_2,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-name-record-ids.constant';

import { SearchResultEdgeDTO } from 'src/engine/core-modules/search/dtos/search-result-edge.dto';
import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { SearchCursor } from 'src/engine/core-modules/search/services/search.service';
import { SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';

describe('SearchResolver', () => {
  let listingObjectMetadataId: { objectMetadataId: string };
  const [firstPerson, secondPerson, thirdPerson] = [
    { id: TEST_PERSON_1_ID, name: { firstName: 'searchInput1' } },
    { id: TEST_PERSON_2_ID, name: { firstName: 'searchInput2' } },
    { id: TEST_PERSON_3_ID, name: { firstName: 'searchInput3' } },
  ];

  const [apiKey] = [
    {
      id: TEST_API_KEY_1_ID,
      name: 'record not searchable',
      expiresAt: new Date(Date.now()),
    },
  ];

  const [firstListing, secondListing] = [
    { id: TEST_LISTING_ID_1, name: 'searchInput1' },
    { id: TEST_LISTING_ID_2, name: 'searchInput2' },
  ];

  beforeAll(async () => {
    await deleteAllRecords('person');
    await deleteAllRecords('company');
    await deleteAllRecords('opportunity');
    await deleteAllRecords('workspaceMember');
    await deleteAllRecords('_pet');
    await deleteAllRecords('_surveyResult');

    try {
      const objectsMetadata = await findManyObjectMetadata({
        input: {
          filter: {},
          paging: {
            first: 1000,
          },
        },
      });

      const listingObjectMetadata = objectsMetadata.objects.find(
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
    input: SearchArgs;
    eval: {
      orderedRecordIds: string[];
      pageInfo: {
        hasNextPage: boolean;
        decodedEndCursor: SearchCursor | null;
      };
    };
  }>[] = [
    {
      title:
        'should return all records for "isSearchable:true" objects when no search input is provided',
      context: {
        input: {
          searchInput: '',
          limit: 50,
        },
        eval: {
          orderedRecordIds: [
            firstPerson.id,
            secondPerson.id,
            thirdPerson.id,
            firstListing.id,
            secondListing.id,
          ],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                person: thirdPerson.id,
                [LISTING_NAME_SINGULAR]: secondListing.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should return filtered records when search input is provided',
      context: {
        input: {
          searchInput: 'searchInput1',
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstPerson.id, firstListing.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: firstPerson.id,
                [LISTING_NAME_SINGULAR]: firstListing.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should return record from included Objects only',
      context: {
        input: {
          searchInput: '',
          includedObjectNameSingulars: [LISTING_NAME_SINGULAR],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstListing.id, secondListing.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                [LISTING_NAME_SINGULAR]: secondListing.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should not return record from excludedObject',
      context: {
        input: {
          searchInput: '',
          excludedObjectNameSingulars: ['person'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstListing.id, secondListing.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                [LISTING_NAME_SINGULAR]: secondListing.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should return filtered records when filter is provided',
      context: {
        input: {
          searchInput: '',
          filter: { id: { eq: firstListing.id } },
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstListing.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                [LISTING_NAME_SINGULAR]: firstListing.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should limit records number with limit',
      context: {
        input: {
          searchInput: '',
          limit: 4,
        },
        eval: {
          orderedRecordIds: [
            firstPerson.id,
            secondPerson.id,
            thirdPerson.id,
            firstListing.id,
          ],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                [LISTING_NAME_SINGULAR]: firstListing.id,
                person: thirdPerson.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should return endCursor when paginating',
      context: {
        input: {
          searchInput: '',
          limit: 2,
        },
        eval: {
          orderedRecordIds: [firstPerson.id, secondPerson.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                person: secondPerson.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should return endCursor when paginating with Cursor',
      context: {
        input: {
          searchInput: '',
          after: encodeCursorData({
            lastRanks: { tsRank: 0, tsRankCD: 0 },
            lastRecordIdsPerObject: {
              person: secondPerson.id,
            },
          }),
          limit: 2,
        },
        eval: {
          orderedRecordIds: [thirdPerson.id, firstListing.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                [LISTING_NAME_SINGULAR]: firstListing.id,
                person: thirdPerson.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should limit records number with limit and searchInput',
      context: {
        input: {
          searchInput: 'searchInput',
          limit: 4,
        },
        eval: {
          orderedRecordIds: [
            firstPerson.id,
            secondPerson.id,
            thirdPerson.id,
            firstListing.id,
          ],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                [LISTING_NAME_SINGULAR]: firstListing.id,
                person: thirdPerson.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should return endCursor when paginating with searchInput',
      context: {
        input: {
          searchInput: 'searchInput',
          limit: 2,
        },
        eval: {
          orderedRecordIds: [firstPerson.id, secondPerson.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: secondPerson.id,
              },
            },
          },
        },
      },
    },
    {
      title:
        'should return endCursor when paginating with searchInput with Cursor',
      context: {
        input: {
          searchInput: 'searchInput',
          after: encodeCursorData({
            lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
            lastRecordIdsPerObject: {
              person: secondPerson.id,
            },
          }),
          limit: 2,
        },
        eval: {
          orderedRecordIds: [thirdPerson.id, firstListing.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                [LISTING_NAME_SINGULAR]: firstListing.id,
                person: thirdPerson.id,
              },
            },
          },
        },
      },
    },
    {
      title:
        'should return endCursor when paginating with searchInput with Cursor and filter',
      context: {
        input: {
          searchInput: 'searchInput',
          after: encodeCursorData({
            lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
            lastRecordIdsPerObject: {
              person: secondPerson.id,
            },
          }),
          limit: 2,
          filter: { id: { neq: firstListing.id } },
        },
        eval: {
          orderedRecordIds: [thirdPerson.id, secondListing.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: thirdPerson.id,
                [LISTING_NAME_SINGULAR]: secondListing.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should paginate properly with excludedObject',
      context: {
        input: {
          searchInput: '',
          excludedObjectNameSingulars: ['person'],
          limit: 1,
        },
        eval: {
          orderedRecordIds: [firstListing.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                [LISTING_NAME_SINGULAR]: firstListing.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should paginate properly with included Objects only',
      context: {
        input: {
          searchInput: '',
          includedObjectNameSingulars: [LISTING_NAME_SINGULAR],
          limit: 1,
        },
        eval: {
          orderedRecordIds: [firstListing.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                [LISTING_NAME_SINGULAR]: firstListing.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should paginate properly when no records are returned',
      context: {
        input: {
          searchInput: '',
          limit: 0,
        },
        eval: {
          orderedRecordIds: [],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: null,
          },
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
    const edges = search.edges;
    const pageInfo = search.pageInfo;

    context.eval.orderedRecordIds.length > 0
      ? expect(edges).not.toHaveLength(0)
      : expect(edges).toHaveLength(0);

    expect(
      edges.map((edge: SearchResultEdgeDTO) => edge.node.recordId),
    ).toEqual(context.eval.orderedRecordIds);

    expect(pageInfo).toBeDefined();
    expect(context.eval.pageInfo.hasNextPage).toEqual(pageInfo.hasNextPage);
    expect(context.eval.pageInfo.decodedEndCursor).toEqual(
      pageInfo.endCursor
        ? decodeCursor(pageInfo.endCursor)
        : pageInfo.endCursor,
    );
  });

  it('should return cursor for each search edge', async () => {
    const graphqlOperation = searchFactory({
      searchInput: 'searchInput',
      limit: 2,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const expectedResult = {
      edges: [
        {
          cursor: encodeCursorData({
            lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
            lastRecordIdsPerObject: {
              person: firstPerson.id,
            },
          }),
        },
        {
          cursor: encodeCursorData({
            lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
            lastRecordIdsPerObject: {
              person: secondPerson.id,
            },
          }),
        },
      ],
      pageInfo: {
        hasNextPage: true,
        endCursor: encodeCursorData({
          lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
          lastRecordIdsPerObject: {
            person: secondPerson.id,
          },
        }),
      },
    };

    expect({
      ...response.body.data.search,
      edges: response.body.data.search.edges.map(
        (edge: SearchResultEdgeDTO) => ({
          cursor: edge.cursor,
        }),
      ),
    }).toEqual(expectedResult);
  });

  it('should return cursor for each search edge with after cursor input', async () => {
    const graphqlOperation = searchFactory({
      searchInput: 'searchInput',
      limit: 2,
      after: encodeCursorData({
        lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
        lastRecordIdsPerObject: {
          person: secondPerson.id,
        },
      }),
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const expectedResult = {
      edges: [
        {
          cursor: encodeCursorData({
            lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
            lastRecordIdsPerObject: {
              person: thirdPerson.id,
            },
          }),
        },
        {
          cursor: encodeCursorData({
            lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
            lastRecordIdsPerObject: {
              person: thirdPerson.id,
              [LISTING_NAME_SINGULAR]: firstListing.id,
            },
          }),
        },
      ],
      pageInfo: {
        hasNextPage: true,
        endCursor: encodeCursorData({
          lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
          lastRecordIdsPerObject: {
            person: thirdPerson.id,
            [LISTING_NAME_SINGULAR]: firstListing.id,
          },
        }),
      },
    };

    expect({
      ...response.body.data.search,
      edges: response.body.data.search.edges.map(
        (edge: SearchResultEdgeDTO) => ({
          cursor: edge.cursor,
        }),
      ),
    }).toEqual(expectedResult);
  });
});
