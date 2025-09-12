import { OBJECT_MODEL_COMMON_FIELDS } from 'test/integration/constants/object-model-common-fields';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
  TEST_PERSON_3_ID,
} from 'test/integration/constants/test-person-ids.constants';
import {
  TEST_PET_ID_1,
  TEST_PET_ID_2,
} from 'test/integration/constants/test-pet-ids.constants';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { performCreateManyOperation } from 'test/integration/graphql/utils/perform-create-many-operation.utils';
import { searchFactory } from 'test/integration/graphql/utils/search-factory.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { type EachTestingContext } from 'twenty-shared/testing';

import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { type SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';
import { type SearchResultEdgeDTO } from 'src/engine/core-modules/search/dtos/search-result-edge.dto';
import { type SearchCursor } from 'src/engine/core-modules/search/services/search.service';

describe('SearchResolver', () => {
  const [firstPerson, secondPerson, thirdPerson] = [
    { id: TEST_PERSON_1_ID, name: { firstName: 'searchInput1' } },
    { id: TEST_PERSON_2_ID, name: { firstName: 'searchInput2' } },
    { id: TEST_PERSON_3_ID, name: { firstName: 'searchInput3' } },
  ];

  const [firstPet, secondPet] = [
    { id: TEST_PET_ID_1, name: 'searchInput1' },
    { id: TEST_PET_ID_2, name: 'searchInput2' },
  ];

  beforeAll(async () => {
    await deleteAllRecords('person');
    await deleteAllRecords('company');
    await deleteAllRecords('opportunity');
    await deleteAllRecords('note');
    await deleteAllRecords('task');
    await deleteAllRecords('noteTarget');
    await deleteAllRecords('taskTarget');
    await deleteAllRecords('dashboard');
    await deleteAllRecords('_pet');
    await deleteAllRecords('_surveyResult');

    try {
      await performCreateManyOperation(
        'pet',
        'pets',
        OBJECT_MODEL_COMMON_FIELDS,
        [firstPet, secondPet],
      );

      await performCreateManyOperation('person', 'people', PERSON_GQL_FIELDS, [
        firstPerson,
        secondPerson,
        thirdPerson,
      ]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      throw new Error('beforeAll failed');
    }
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
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [
            firstPerson.id,
            secondPerson.id,
            thirdPerson.id,
            firstPet.id,
            secondPet.id,
          ],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                person: thirdPerson.id,
                pet: secondPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstPerson.id, firstPet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: firstPerson.id,
                pet: firstPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember'],
          includedObjectNameSingulars: ['pet'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstPet.id, secondPet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: secondPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember', 'person'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstPet.id, secondPet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: secondPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember'],
          filter: { id: { eq: firstPet.id } },
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstPet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: firstPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 4,
        },
        eval: {
          orderedRecordIds: [
            firstPerson.id,
            secondPerson.id,
            thirdPerson.id,
            firstPet.id,
          ],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: firstPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember'],
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
          excludedObjectNameSingulars: ['workspaceMember'],
          after: encodeCursorData({
            lastRanks: { tsRank: 0, tsRankCD: 0 },
            lastRecordIdsPerObject: {
              person: secondPerson.id,
            },
          }),
          limit: 2,
        },
        eval: {
          orderedRecordIds: [thirdPerson.id, firstPet.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: firstPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 4,
        },
        eval: {
          orderedRecordIds: [
            firstPerson.id,
            secondPerson.id,
            thirdPerson.id,
            firstPet.id,
          ],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                pet: firstPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember'],
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
          excludedObjectNameSingulars: ['workspaceMember'],
          after: encodeCursorData({
            lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
            lastRecordIdsPerObject: {
              person: secondPerson.id,
            },
          }),
          limit: 2,
        },
        eval: {
          orderedRecordIds: [thirdPerson.id, firstPet.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                pet: firstPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember'],
          after: encodeCursorData({
            lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
            lastRecordIdsPerObject: {
              person: secondPerson.id,
            },
          }),
          limit: 2,
          filter: { id: { neq: firstPet.id } },
        },
        eval: {
          orderedRecordIds: [thirdPerson.id, secondPet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: thirdPerson.id,
                pet: secondPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember', 'person'],
          limit: 1,
        },
        eval: {
          orderedRecordIds: [firstPet.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: firstPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember'],
          includedObjectNameSingulars: ['pet'],
          limit: 1,
        },
        eval: {
          orderedRecordIds: [firstPet.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: firstPet.id,
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
          excludedObjectNameSingulars: ['workspaceMember'],
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

    if (context.eval.orderedRecordIds.length > 0) {
      expect(edges).not.toHaveLength(0);
    } else {
      expect(edges).toHaveLength(0);
    }

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
      excludedObjectNameSingulars: ['workspaceMember'],
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
      excludedObjectNameSingulars: ['workspaceMember'],
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
              pet: firstPet.id,
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
            pet: firstPet.id,
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
