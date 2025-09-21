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
  const persons = [
    { id: TEST_PERSON_1_ID, name: { firstName: 'searchInput1' } },
    { id: TEST_PERSON_2_ID, name: { firstName: 'searchInput2' } },
    { id: TEST_PERSON_3_ID, name: { firstName: 'searchInput3' } },
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

  const companies = [
    { id: TEST_COMPANY_1_ID, name: 'Café Corp' },
    { id: TEST_COMPANY_2_ID, name: 'Naïve Solutions' },
  ];

  const pets = [
    { id: TEST_PET_ID_1, name: 'searchInput1' },
    { id: TEST_PET_ID_2, name: 'searchInput2' },
    { id: TEST_PET_ID_3, name: 'Café' },
    { id: TEST_PET_ID_4, name: 'Naïve' },
  ];

  const [
    searchInput1Person,
    searchInput2Person,
    searchInput3Person,
    josePerson,
    francoisPerson,
    josePersonNoAccent,
    francoisPersonNoAccent,
  ] = persons;
  const [cafeCorp, naiveCorp] = companies;
  const [searchInput1Pet, searchInput2Pet, cafePet, naivePet] = pets;

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
        pets,
      );

      await performCreateManyOperation(
        'person',
        'people',
        PERSON_GQL_FIELDS,
        persons,
      );

      await performCreateManyOperation(
        'company',
        'companies',
        COMPANY_GQL_FIELDS,
        companies,
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
            searchInput1Person.id,
            searchInput2Person.id,
            searchInput3Person.id,
            josePerson.id,
            francoisPerson.id,
            josePersonNoAccent.id,
            francoisPersonNoAccent.id,
            naiveCorp.id,
            cafeCorp.id,
            searchInput1Pet.id,
            searchInput2Pet.id,
            cafePet.id,
            naivePet.id,
          ],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                person: francoisPersonNoAccent.id,
                company: cafeCorp.id,
                pet: naivePet.id,
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
          orderedRecordIds: [searchInput1Person.id, searchInput1Pet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: searchInput1Person.id,
                pet: searchInput1Pet.id,
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
          orderedRecordIds: [
            searchInput1Pet.id,
            searchInput2Pet.id,
            cafePet.id,
            naivePet.id,
          ],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: naivePet.id,
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
          orderedRecordIds: [
            naiveCorp.id,
            cafeCorp.id,
            searchInput1Pet.id,
            searchInput2Pet.id,
            cafePet.id,
            naivePet.id,
          ],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                company: cafeCorp.id,
                pet: naivePet.id,
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
          filter: { id: { eq: searchInput1Pet.id } },
          limit: 50,
        },
        eval: {
          orderedRecordIds: [searchInput1Pet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: searchInput1Pet.id,
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
            searchInput1Person.id,
            searchInput2Person.id,
            searchInput3Person.id,
            josePerson.id,
          ],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                person: josePerson.id,
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
          orderedRecordIds: [searchInput1Person.id, searchInput2Person.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                person: searchInput2Person.id,
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
              person: searchInput2Person.id,
            },
          }),
          limit: 2,
        },
        eval: {
          orderedRecordIds: [searchInput3Person.id, josePerson.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                person: josePerson.id,
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
            searchInput1Person.id,
            searchInput2Person.id,
            searchInput3Person.id,
            searchInput1Pet.id,
          ],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                pet: searchInput1Pet.id,
                person: searchInput3Person.id,
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
          orderedRecordIds: [searchInput1Person.id, searchInput2Person.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: searchInput2Person.id,
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
              person: searchInput2Person.id,
            },
          }),
          limit: 2,
        },
        eval: {
          orderedRecordIds: [searchInput3Person.id, searchInput1Pet.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                pet: searchInput1Pet.id,
                person: searchInput3Person.id,
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
              person: searchInput2Person.id,
            },
          }),
          limit: 2,
          filter: { id: { neq: searchInput1Pet.id } },
        },
        eval: {
          orderedRecordIds: [searchInput3Person.id, searchInput2Pet.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: searchInput3Person.id,
                pet: searchInput2Pet.id,
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
          orderedRecordIds: [naiveCorp.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                company: naiveCorp.id,
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
          orderedRecordIds: [searchInput1Pet.id],
          pageInfo: {
            hasNextPage: true,
            decodedEndCursor: {
              lastRanks: { tsRank: 0, tsRankCD: 0 },
              lastRecordIdsPerObject: {
                pet: searchInput1Pet.id,
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
      title:
        'should find both "José" and "Jose" when searching for "jose" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'jose',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [josePerson.id, josePersonNoAccent.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.12158542, tsRankCD: 0.2 },
              lastRecordIdsPerObject: {
                person: josePersonNoAccent.id,
              },
            },
          },
        },
      },
    },
    {
      title:
        'should find both "García" and "Garcia" when searching for "garcia" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'garcia',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [josePerson.id, josePersonNoAccent.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: josePersonNoAccent.id,
              },
            },
          },
        },
      },
    },
    {
      title:
        'should find both accented and non-accented "Café"/"Cafe" records when searching for "cafe" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'cafe',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [
            josePerson.id,
            josePersonNoAccent.id,
            cafeCorp.id,
            cafePet.id,
          ],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: josePersonNoAccent.id,
                company: cafeCorp.id,
                pet: cafePet.id,
              },
            },
          },
        },
      },
    },
    {
      title:
        'should find both accented and non-accented "Naïve"/"Naive" records when searching for "naive" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'naive',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [
            francoisPerson.id,
            francoisPersonNoAccent.id,
            naiveCorp.id,
            naivePet.id,
          ],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: francoisPersonNoAccent.id,
                company: naiveCorp.id,
                pet: naivePet.id,
              },
            },
          },
        },
      },
    },
    {
      title:
        'should find both "Müller" and "Muller" when searching for "muller" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'muller',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [francoisPerson.id, francoisPersonNoAccent.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.06079271, tsRankCD: 0.1 },
              lastRecordIdsPerObject: {
                person: francoisPersonNoAccent.id,
              },
            },
          },
        },
      },
    },
    {
      title:
        'should find both "François" and "Francois" when searching for "francois" (bidirectional accent-insensitive)',
      context: {
        input: {
          searchInput: 'francois',
          excludedObjectNameSingulars: ['workspaceMember'],
          limit: 50,
        },
        eval: {
          orderedRecordIds: [francoisPerson.id, francoisPersonNoAccent.id],
          pageInfo: {
            hasNextPage: false,
            decodedEndCursor: {
              lastRanks: { tsRank: 0.12158542, tsRankCD: 0.2 },
              lastRecordIdsPerObject: {
                person: francoisPersonNoAccent.id,
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
              person: searchInput1Person.id,
            },
          }),
        },
        {
          cursor: encodeCursorData({
            lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
            lastRecordIdsPerObject: {
              person: searchInput2Person.id,
            },
          }),
        },
      ],
      pageInfo: {
        hasNextPage: true,
        endCursor: encodeCursorData({
          lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
          lastRecordIdsPerObject: {
            person: searchInput2Person.id,
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
          person: searchInput2Person.id,
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
              person: searchInput3Person.id,
            },
          }),
        },
        {
          cursor: encodeCursorData({
            lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
            lastRecordIdsPerObject: {
              person: searchInput3Person.id,
              pet: searchInput1Pet.id,
            },
          }),
        },
      ],
      pageInfo: {
        hasNextPage: true,
        endCursor: encodeCursorData({
          lastRanks: { tsRankCD: 0.1, tsRank: 0.06079271 },
          lastRecordIdsPerObject: {
            person: searchInput3Person.id,
            pet: searchInput1Pet.id,
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
