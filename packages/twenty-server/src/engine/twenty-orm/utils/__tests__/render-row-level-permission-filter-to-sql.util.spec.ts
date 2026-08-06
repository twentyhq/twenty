import {
  FieldMetadataType,
  type RecordGqlOperationFilter,
  RelationType,
} from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';

const createFlatFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: 'field-id',
    name: 'field',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'field-universal-id',
    ...overrides,
  }) as FlatFieldMetadata;

const nameField = createFlatFieldMetadata({
  id: 'name-field-id',
  name: 'name',
  type: FieldMetadataType.TEXT,
  universalIdentifier: 'name-field-universal-id',
});

const employeesField = createFlatFieldMetadata({
  id: 'employees-field-id',
  name: 'employees',
  type: FieldMetadataType.NUMBER,
  universalIdentifier: 'employees-field-universal-id',
});

const annualRecurringRevenueField = createFlatFieldMetadata({
  id: 'annual-recurring-revenue-field-id',
  name: 'annualRecurringRevenue',
  type: FieldMetadataType.CURRENCY,
  universalIdentifier: 'annual-recurring-revenue-field-universal-id',
});

const accountOwnerField = createFlatFieldMetadata({
  id: 'account-owner-field-id',
  name: 'accountOwner',
  type: FieldMetadataType.RELATION,
  universalIdentifier: 'account-owner-field-universal-id',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'accountOwnerId',
  },
} as Partial<FlatFieldMetadata>);

const companyFields = [
  nameField,
  employeesField,
  annualRecurringRevenueField,
  accountOwnerField,
];

const companyObjectMetadata = {
  id: 'company-object-id',
  nameSingular: 'company',
  namePlural: 'companies',
  fieldIds: companyFields.map((field) => field.id),
  universalIdentifier: 'company-object-universal-id',
} as FlatObjectMetadata;

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: Object.fromEntries(
    companyFields.map((field) => [field.universalIdentifier, field]),
  ),
  universalIdentifierById: Object.fromEntries(
    companyFields.map((field) => [field.id, field.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
};

const findParameterKeyByValue = (
  parameters: ObjectLiteral,
  value: unknown,
): string | undefined =>
  Object.entries(parameters).find(
    ([, parameterValue]) => parameterValue === value,
  )?.[0];

describe('renderRowLevelPermissionFilterToSql', () => {
  const baseArgs = {
    tableAlias: 'company',
    objectMetadata: companyObjectMetadata,
    flatFieldMetadataMaps,
  };

  it('returns null for an empty filter', () => {
    expect(
      renderRowLevelPermissionFilterToSql({
        ...baseArgs,
        recordFilter: {},
      }),
    ).toBeNull();
  });

  it('renders a single field condition referencing the join alias', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { name: { ilike: '%Visible%' } },
    });

    const nameParameterKey = findParameterKeyByValue(
      result?.parameters ?? {},
      '%Visible%',
    );

    expect(nameParameterKey).toMatch(/^name[0-9a-f]{10}$/);
    expect(result?.sql).toBe(
      `("company"."name"::text ILIKE :${nameParameterKey})`,
    );
  });

  it('combines multiple top-level keys with AND', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { name: { ilike: '%x%' }, employees: { gte: 5 } },
    });

    const parameters = result?.parameters ?? {};
    const nameParameterKey = findParameterKeyByValue(parameters, '%x%');
    const employeesParameterKey = findParameterKeyByValue(parameters, 5);

    expect(result?.sql).toBe(
      `(("company"."name"::text ILIKE :${nameParameterKey}) AND ("company"."employees" >= :${employeesParameterKey}))`,
    );
  });

  it('combines multiple operators on a single field with AND', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { employees: { gte: 1, lte: 5 } },
    });

    const parameters = result?.parameters ?? {};
    const lowerBoundParameterKey = findParameterKeyByValue(parameters, 1);
    const upperBoundParameterKey = findParameterKeyByValue(parameters, 5);

    expect(Object.keys(parameters)).toHaveLength(2);
    expect(result?.sql).toBe(
      `(("company"."employees" >= :${lowerBoundParameterKey}) AND ("company"."employees" <= :${upperBoundParameterKey}))`,
    );
  });

  it('renders an or group', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: {
        or: [{ employees: { gte: 1 } }, { employees: { lte: 5 } }],
      },
    });

    const parameters = result?.parameters ?? {};
    const lowerBoundParameterKey = findParameterKeyByValue(parameters, 1);
    const upperBoundParameterKey = findParameterKeyByValue(parameters, 5);

    expect(result?.sql).toBe(
      `(("company"."employees" >= :${lowerBoundParameterKey}) OR ("company"."employees" <= :${upperBoundParameterKey}))`,
    );
  });

  it('renders a singleton or filter that is not wrapped in an array', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { or: { name: { ilike: '%x%' } } },
    });

    const nameParameterKey = findParameterKeyByValue(
      result?.parameters ?? {},
      '%x%',
    );

    expect(result?.sql).toBe(
      `(("company"."name"::text ILIKE :${nameParameterKey}))`,
    );
  });

  it('renders a not group over a join column condition', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { not: { accountOwnerId: { in: ['id-1'] } } },
    });

    const parameters = result?.parameters ?? {};
    const [accountOwnerIdParameterKey] = Object.keys(parameters);

    expect(accountOwnerIdParameterKey).toMatch(/^accountOwnerId[0-9a-f]{10}$/);
    expect(parameters[accountOwnerIdParameterKey]).toEqual(['id-1']);
    expect(result?.sql).toBe(
      `NOT (("company"."accountOwnerId" IN (:...${accountOwnerIdParameterKey})))`,
    );
  });

  it('renders the IS_NOT relation shape (or of not-in and is-null)', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: {
        or: [
          { not: { accountOwnerId: { in: ['id-1'] } } },
          { accountOwnerId: { is: 'NULL' } },
        ],
      },
    });

    const parameters = result?.parameters ?? {};
    const [accountOwnerIdParameterKey] = Object.keys(parameters);

    expect(result?.sql).toBe(
      `(NOT (("company"."accountOwnerId" IN (:...${accountOwnerIdParameterKey}))) OR ("company"."accountOwnerId" IS NULL))`,
    );
  });

  it('renders a composite sub field condition with the flattened column name', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { annualRecurringRevenue: { amountMicros: { gte: 1000 } } },
    });

    const parameters = result?.parameters ?? {};
    const amountMicrosParameterKey = findParameterKeyByValue(parameters, 1000);

    expect(amountMicrosParameterKey).toMatch(
      /^annualRecurringRevenueAmountMicros[0-9a-f]{10}$/,
    );
    expect(result?.sql).toBe(
      `("company"."annualRecurringRevenueAmountMicros" >= :${amountMicrosParameterKey})`,
    );
  });

  it('throws for an unknown composite sub field', () => {
    expect(() =>
      renderRowLevelPermissionFilterToSql({
        ...baseArgs,
        recordFilter: {
          annualRecurringRevenue: { bogus: { eq: 1 } },
        } as unknown as RecordGqlOperationFilter,
      }),
    ).toThrow('is not a sub field of composite type');
  });

  it('throws for a field that does not exist on the object', () => {
    expect(() =>
      renderRowLevelPermissionFilterToSql({
        ...baseArgs,
        recordFilter: { nonexistent: { eq: 1 } },
      }),
    ).toThrow('field "nonexistent" does not exist');
  });

  it('throws for a relation referenced by field name', () => {
    expect(() =>
      renderRowLevelPermissionFilterToSql({
        ...baseArgs,
        recordFilter: { accountOwner: { name: { eq: 'x' } } },
      }),
    ).toThrow('traversing a relation requires an additional join');
  });

  it('throws for an array operator with an empty array', () => {
    expect(() =>
      renderRowLevelPermissionFilterToSql({
        ...baseArgs,
        recordFilter: { name: { in: [] } },
      }),
    ).toThrow('Expected non-empty array');
  });

  it('renders a nested empty logical group as always-true, like TypeORM empty Brackets', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { or: [{ or: [] }, { name: { ilike: '%x%' } }] },
    });

    const nameParameterKey = findParameterKeyByValue(
      result?.parameters ?? {},
      '%x%',
    );

    expect(result?.sql).toBe(
      `(1=1 OR ("company"."name"::text ILIKE :${nameParameterKey}))`,
    );
  });

  it('renders a top-level empty logical group as always-true', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { or: [] },
    });

    expect(result?.sql).toBe('1=1');
    expect(result?.parameters).toEqual({});
  });

  it('renders not of an empty filter as the negation of always-true', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { not: {} },
    });

    expect(result?.sql).toBe('NOT (1=1)');
  });

  it('merges parameters from every leaf and conjoins the groups', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: {
        and: [{ name: { ilike: 'a' } }, { employees: { eq: 2 } }],
      },
    });

    const parameters = result?.parameters ?? {};
    const nameParameterKey = findParameterKeyByValue(parameters, 'a');
    const employeesParameterKey = findParameterKeyByValue(parameters, 2);

    expect(result?.sql).toBe(
      `(("company"."name"::text ILIKE :${nameParameterKey}) AND ("company"."employees" = :${employeesParameterKey}))`,
    );
    expect(Object.keys(parameters)).toHaveLength(2);
    expect(findParameterKeyByValue(parameters, 'a')).toMatch(
      /^name[0-9a-f]{10}$/,
    );
    expect(findParameterKeyByValue(parameters, 2)).toMatch(
      /^employees[0-9a-f]{10}$/,
    );
  });
});
