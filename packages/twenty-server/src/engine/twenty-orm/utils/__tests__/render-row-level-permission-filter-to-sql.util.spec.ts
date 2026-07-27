import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';

jest.mock(
  'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util',
  () => ({
    buildFieldMapsFromFlatObjectMetadata: () => ({
      fieldIdByName: new Proxy({}, { get: (_, key) => key }),
      fieldIdByJoinColumnName: {},
    }),
  }),
);

jest.mock(
  'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util',
  () => ({
    findFlatEntityByIdInFlatEntityMaps: ({
      flatEntityId,
    }: {
      flatEntityId: string;
    }) => ({ name: flatEntityId, type: 'TEXT' }),
  }),
);

jest.mock(
  'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util',
  () => ({ isCompositeFieldMetadataType: () => false }),
);

jest.mock(
  'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util',
  () => ({ isMorphOrRelationFlatFieldMetadata: () => false }),
);

jest.mock(
  'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts',
  () => ({
    computeWhereConditionParts: ({
      operator,
      objectNameSingular,
      key,
      value,
    }: {
      operator: string;
      objectNameSingular: string;
      key: string;
      value: unknown;
    }) => ({
      sql: `"${objectNameSingular}"."${key}" ${operator}`,
      params: { [`${key}_p`]: value },
    }),
  }),
);

describe('renderRowLevelPermissionFilterToSql', () => {
  const baseArgs = {
    tableAlias: 'company',
    objectMetadata: {} as FlatObjectMetadata,
    flatFieldMetadataMaps: {} as FlatEntityMaps<FlatFieldMetadata>,
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

    expect(result?.sql).toBe('("company"."name" ilike)');
    expect(result?.parameters).toEqual({ name_p: '%Visible%' });
  });

  it('combines multiple top-level keys with AND', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { name: { ilike: '%x%' }, employees: { gte: 5 } },
    });

    expect(result?.sql).toBe(
      '(("company"."name" ilike) AND ("company"."employees" gte))',
    );
  });

  it('renders an or group', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { or: [{ a: { eq: 1 } }, { b: { eq: 2 } }] },
    });

    expect(result?.sql).toBe('(("company"."a" eq) OR ("company"."b" eq))');
  });

  it('renders a not group wrapped in parentheses', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: { not: { companyId: { in: ['id-1'] } } },
    });

    expect(result?.sql).toBe('NOT (("company"."companyId" in))');
    expect(result?.parameters).toEqual({ companyId_p: ['id-1'] });
  });

  it('renders the IS_NOT relation shape (or of not-in and is-null)', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: {
        or: [
          { not: { companyId: { in: ['id-1'] } } },
          { companyId: { is: 'NULL' } },
        ],
      },
    });

    expect(result?.sql).toBe(
      '(NOT (("company"."companyId" in)) OR ("company"."companyId" is))',
    );
  });

  it('merges parameters from every leaf', () => {
    const result = renderRowLevelPermissionFilterToSql({
      ...baseArgs,
      recordFilter: {
        and: [{ a: { eq: 1 } }, { b: { eq: 2 } }],
      },
    });

    expect(result?.parameters).toEqual({ a_p: 1, b_p: 2 });
  });
});
