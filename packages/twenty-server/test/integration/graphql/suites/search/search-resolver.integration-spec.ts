import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { OBJECT_MODEL_COMMON_FIELDS } from 'test/integration/constants/object-model-common-fields';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import {
  TEST_COMPANY_1_ID,
  TEST_COMPANY_2_ID,
} from 'test/integration/constants/test-company-ids.constants';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
  TEST_PERSON_3_ID,
  TEST_PERSON_4_ID,
  TEST_PERSON_5_ID,
  TEST_PERSON_6_ID,
  TEST_PERSON_7_ID,
} from 'test/integration/constants/test-person-ids.constants';
import {
  TEST_PET_ID_1,
  TEST_PET_ID_2,
  TEST_PET_ID_3,
  TEST_PET_ID_4,
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

  const [firstAccentPerson, secondAccentPerson] = [
    {
      id: TEST_PERSON_4_ID,
      name: { firstName: 'José', lastName: 'García' },
      jobTitle: 'Café Manager',
      emails: { primaryEmail: 'josé@café.com' },
    },
    {
      id: TEST_PERSON_5_ID,
      name: { firstName: 'François', lastName: 'Müller' },
      jobTitle: 'Manager',
      emails: { primaryEmail: 'françois@naïve.com' },
    },
  ];

  const [firstNonAccentPerson, secondNonAccentPerson] = [
    {
      id: TEST_PERSON_6_ID,
      name: { firstName: 'Jose', lastName: 'Garcia' },
      jobTitle: 'Cafe Manager',
      emails: { primaryEmail: 'jose@cafe.com' },
    },
    {
      id: TEST_PERSON_7_ID,
      name: { firstName: 'Francois', lastName: 'Muller' },
      jobTitle: 'Manager',
      emails: { primaryEmail: 'francois@naive.com' },
    },
  ];

  const [firstAccentCompany, secondAccentCompany] = [
    { id: TEST_COMPANY_1_ID, name: 'Café Corp' },
    { id: TEST_COMPANY_2_ID, name: 'Naïve Solutions' },
  ];

  const [firstAccentPet, secondAccentPet] = [
    { id: TEST_PET_ID_3, name: 'Café' },
    { id: TEST_PET_ID_4, name: 'Naïve' },
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
        [firstPet, secondPet, firstAccentPet, secondAccentPet],
      );

      await performCreateManyOperation('person', 'people', PERSON_GQL_FIELDS, [
        firstPerson,
        secondPerson,
        thirdPerson,
        firstAccentPerson,
        secondAccentPerson,
        firstNonAccentPerson,
        secondNonAccentPerson,
      ]);

      await performCreateManyOperation(
        'company',
        'companies',
        COMPANY_GQL_FIELDS,
        [firstAccentCompany, secondAccentCompany],
      );
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
            firstAccentPerson.id,
            secondAccentPerson.id,
            firstNonAccentPerson.id,
            secondNonAccentPerson.id,
            secondAccentCompany.id,
            firstAccentCompany.id,
            firstPet.id,
            secondPet.id,
            firstAccentPet.id,
            secondAccentPet.id,
          ],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                person: secondNonAccentPerson.id,
                company: firstAccentCompany.id,
                pet: secondAccentPet.id,
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
          orderedRecordIds: [firstPet.id, secondPet.id, firstAccentPet.id, secondAccentPet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: secondAccentPet.id,
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
          orderedRecordIds: [secondAccentCompany.id, firstAccentCompany.id, firstPet.id, secondPet.id, firstAccentPet.id, secondAccentPet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                company: firstAccentCompany.id,
                pet: secondAccentPet.id,
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
            firstAccentPerson.id,
          ],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                person: firstAccentPerson.id,
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
          orderedRecordIds: [thirdPerson.id, firstAccentPerson.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                person: firstAccentPerson.id,
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
          orderedRecordIds: [secondAccentCompany.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                company: secondAccentCompany.id,
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
    {
      title: 'should find both "José" and "Jose" when searching for "jose" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'jose',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstAccentPerson.id, firstNonAccentPerson.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.12158542, tsRankCD: 0.2 },
              lastRecordIdsPerObject: {
                person: firstNonAccentPerson.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should find both "García" and "Garcia" when searching for "garcia" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'garcia',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstAccentPerson.id, firstNonAccentPerson.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: firstNonAccentPerson.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should find both accented and non-accented "Café"/"Cafe" records when searching for "cafe" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'cafe',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [firstAccentPerson.id, firstNonAccentPerson.id, firstAccentCompany.id, firstAccentPet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: firstNonAccentPerson.id,
                company: firstAccentCompany.id,
                pet: firstAccentPet.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should find both accented and non-accented "Naïve"/"Naive" records when searching for "naive" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'naive',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [secondAccentPerson.id, secondNonAccentPerson.id, secondAccentCompany.id, secondAccentPet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: secondNonAccentPerson.id,
                company: secondAccentCompany.id,
                pet: secondAccentPet.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should find both "Müller" and "Muller" when searching for "muller" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'muller',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [secondAccentPerson.id, secondNonAccentPerson.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: secondNonAccentPerson.id,
              },
            },
          },
        },
      },
    },
    {
      title: 'should find both "François" and "Francois" when searching for "francois" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'francois',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [secondAccentPerson.id, secondNonAccentPerson.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.12158542, tsRankCD: 0.2 },
              lastRecordIdsPerObject: {
                person: secondNonAccentPerson.id,
              },
            },
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
        lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
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
