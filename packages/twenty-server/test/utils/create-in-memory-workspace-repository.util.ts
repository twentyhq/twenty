import { isDefined } from 'twenty-shared/utils';
import { FindOperator } from 'typeorm';

export type InMemoryRecord = {
  id: string;
  deletedAt?: string | null;
  [columnName: string]: unknown;
};

type InMemoryWhere = Record<string, unknown>;

type InMemoryFindOptions = {
  where?: InMemoryWhere | InMemoryWhere[];
  select?: Record<string, boolean> | string[];
  order?: Record<string, 'ASC' | 'DESC'>;
  take?: number;
  withDeleted?: boolean;
};

type InMemoryDeleteCriteria =
  | string
  | string[]
  | InMemoryWhere
  | InMemoryWhere[];

const compareValues = (left: unknown, right: unknown): number => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  const leftString = String(left);
  const rightString = String(right);

  return leftString < rightString ? -1 : leftString > rightString ? 1 : 0;
};

const buildRegExpFromLikePattern = (pattern: string): RegExp =>
  new RegExp(
    `^${pattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/%/g, '.*')
      .replace(/_/g, '.')}$`,
    'i',
  );

const matchesCondition = (value: unknown, condition: unknown): boolean => {
  if (!(condition instanceof FindOperator)) {
    return isDefined(condition) ? value === condition : !isDefined(value);
  }

  switch (condition.type) {
    case 'and':
      return (condition.value as unknown[]).every((operand) =>
        matchesCondition(value, operand),
      );
    case 'or':
      return (condition.value as unknown[]).some((operand) =>
        matchesCondition(value, operand),
      );
    case 'not':
      return (
        isDefined(value) &&
        !matchesCondition(value, condition.child ?? condition.value)
      );
    case 'in':
    case 'any':
      return (condition.value as unknown[]).includes(value);
    case 'ilike':
      return (
        typeof value === 'string' &&
        buildRegExpFromLikePattern(condition.value as string).test(value)
      );
    case 'lessThan':
      return isDefined(value) && compareValues(value, condition.value) < 0;
    case 'moreThan':
      return isDefined(value) && compareValues(value, condition.value) > 0;
    case 'isNull':
      return !isDefined(value);
    default:
      throw new Error(`Unsupported find operator "${condition.type}"`);
  }
};

const matchesWhere = (
  record: InMemoryRecord,
  where: InMemoryWhere | InMemoryWhere[] | undefined,
): boolean => {
  if (!isDefined(where)) {
    return true;
  }

  if (Array.isArray(where)) {
    return where.some((branch) => matchesWhere(record, branch));
  }

  return Object.entries(where).every(([columnName, condition]) =>
    matchesCondition(record[columnName], condition),
  );
};

const selectColumns = (
  record: InMemoryRecord,
  select: InMemoryFindOptions['select'],
): InMemoryRecord => {
  if (!isDefined(select)) {
    return { ...record };
  }

  const columnNames = Array.isArray(select)
    ? select
    : Object.keys(select).filter((columnName) => select[columnName]);

  return Object.fromEntries(
    columnNames.map((columnName) => [columnName, record[columnName]]),
  ) as InMemoryRecord;
};

export const createInMemoryWorkspaceRepository = (
  initialRecords: InMemoryRecord[],
) => {
  let records = [...initialRecords];
  const deletedIdsByCall: string[][] = [];

  const isReadable = (record: InMemoryRecord, withDeleted?: boolean) =>
    withDeleted === true || !isDefined(record.deletedAt);

  const matchesDeleteCriteria = (
    record: InMemoryRecord,
    criteria: InMemoryDeleteCriteria,
  ) => {
    if (typeof criteria === 'string') {
      return record.id === criteria;
    }

    if (
      Array.isArray(criteria) &&
      criteria.every((entry) => typeof entry === 'string')
    ) {
      return (criteria as string[]).includes(record.id);
    }

    return matchesWhere(record, criteria as InMemoryWhere | InMemoryWhere[]);
  };

  const deleteRecords = async (criteria: InMemoryDeleteCriteria) => {
    const deletedRecords = records.filter((record) =>
      matchesDeleteCriteria(record, criteria),
    );

    records = records.filter(
      (record) => !matchesDeleteCriteria(record, criteria),
    );
    deletedIdsByCall.push(deletedRecords.map(({ id }) => id));

    return {
      raw: deletedRecords.map(({ id }) => ({ id })),
      affected: deletedRecords.length,
    };
  };

  const findRecords = async (options: InMemoryFindOptions = {}) => {
    const matchingRecords = records.filter(
      (record) =>
        isReadable(record, options.withDeleted) &&
        matchesWhere(record, options.where),
    );

    const orderEntries = Object.entries(options.order ?? {});

    const orderedRecords =
      orderEntries.length > 0
        ? [...matchingRecords].sort((left, right) => {
            for (const [columnName, direction] of orderEntries) {
              const comparison = compareValues(
                left[columnName],
                right[columnName],
              );

              if (comparison !== 0) {
                return direction === 'DESC' ? -comparison : comparison;
              }
            }

            return 0;
          })
        : matchingRecords;

    return orderedRecords
      .slice(0, options.take ?? orderedRecords.length)
      .map((record) => selectColumns(record, options.select));
  };

  const repository = {
    find: jest.fn(findRecords),
    findOne: jest.fn(
      async (options: InMemoryFindOptions = {}) =>
        (await findRecords({ ...options, take: 1 }))[0] ?? null,
    ),
    count: jest.fn(
      async (
        options: Pick<InMemoryFindOptions, 'where' | 'withDeleted'> = {},
      ) =>
        records.filter(
          (record) =>
            isReadable(record, options.withDeleted) &&
            matchesWhere(record, options.where),
        ).length,
    ),
    delete: jest.fn(deleteRecords),
  };

  return {
    repository,
    deleteRecords,
    getRecords: () => records,
    getDeletedIdsByCall: () => deletedIdsByCall,
  };
};
