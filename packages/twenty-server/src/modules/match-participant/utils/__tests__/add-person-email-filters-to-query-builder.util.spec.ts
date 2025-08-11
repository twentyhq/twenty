import { type EachTestingContext } from 'twenty-shared/testing';
import { type SelectQueryBuilder } from 'typeorm';

import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type AddPersonEmailFiltersToQueryBuilderTestCase = EachTestingContext<{
  emails: string[];
  excludePersonIds?: string[];
  description: string;
}>;

const testCases: AddPersonEmailFiltersToQueryBuilderTestCase[] = [
  {
    title: 'single email without exclusions',
    context: {
      emails: ['test@example.com'],
      description: 'should handle a single email address correctly',
    },
  },
  {
    title: 'multiple emails without exclusions',
    context: {
      emails: ['test@example.com', 'contact@company.com'],
      description: 'should handle multiple email addresses correctly',
    },
  },
  {
    title: 'single email with person ID exclusions',
    context: {
      emails: ['test@example.com'],
      excludePersonIds: ['person-1', 'person-2'],
      description: 'should handle exclusions with a single email',
    },
  },
  {
    title: 'multiple emails with exclusions',
    context: {
      emails: ['test@example.com', 'contact@company.com'],
      excludePersonIds: ['person-1'],
      description: 'should handle exclusions with multiple emails',
    },
  },
  {
    title: 'empty emails array',
    context: {
      emails: [],
      description: 'should handle empty email array gracefully',
    },
  },
  {
    title: 'emails with empty exclusion array',
    context: {
      emails: ['test@example.com'],
      excludePersonIds: [],
      description: 'should handle empty exclusions array',
    },
  },
  {
    title: 'three emails with unique parameter generation',
    context: {
      emails: [
        'email1@example.com',
        'email2@example.com',
        'email3@example.com',
      ],
      description: 'should create unique parameter names for each email',
    },
  },
  {
    title: 'case-insensitive email normalization',
    context: {
      emails: ['Test@Example.COM', 'CONTACT@Company.com'],
      description: 'should normalize emails to lowercase',
    },
  },
];

interface QueryBuilderCall {
  method: string;
  args: any[];
}

let queryBuilderCalls: QueryBuilderCall[] = [];

const mockQueryBuilder: Partial<SelectQueryBuilder<PersonWorkspaceEntity>> = {
  select: jest.fn().mockImplementation((...args) => {
    queryBuilderCalls.push({ method: 'select', args });

    return mockQueryBuilder;
  }),
  where: jest.fn().mockImplementation((...args) => {
    queryBuilderCalls.push({ method: 'where', args });

    return mockQueryBuilder;
  }),
  andWhere: jest.fn().mockImplementation((...args) => {
    queryBuilderCalls.push({ method: 'andWhere', args });

    return mockQueryBuilder;
  }),
  orWhere: jest.fn().mockImplementation((...args) => {
    queryBuilderCalls.push({ method: 'orWhere', args });

    return mockQueryBuilder;
  }),
  withDeleted: jest.fn().mockImplementation((...args) => {
    queryBuilderCalls.push({ method: 'withDeleted', args });

    return mockQueryBuilder;
  }),
};

describe('addPersonEmailFiltersToQueryBuilder', () => {
  beforeEach(() => {
    queryBuilderCalls = [];
    jest.clearAllMocks();
  });

  it.each(testCases)(
    '$title',
    ({ context: { emails, excludePersonIds, description } }) => {
      const result = addPersonEmailFiltersToQueryBuilder({
        queryBuilder:
          mockQueryBuilder as SelectQueryBuilder<PersonWorkspaceEntity>,
        emails,
        excludePersonIds,
      });

      expect(queryBuilderCalls).toMatchSnapshot(
        `${description} - query builder calls`,
      );

      expect(result).toBe(mockQueryBuilder);
    },
  );
});
