import { createWhereExpressionRecorder } from 'test/utils/create-where-expression-recorder.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { applyRowLevelPermissionPredicates } from 'src/engine/twenty-orm/utils/apply-row-level-permission-predicates.util';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';

jest.mock(
  'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util',
  () => ({
    buildRowLevelPermissionRecordFilter: jest.fn(),
  }),
);

jest.mock(
  'src/engine/twenty-orm/utils/resolve-role-id-from-auth-context.util',
  () => ({
    resolveRoleIdFromAuthContext: jest.fn(() => 'role-id'),
  }),
);

const nameField = {
  id: 'name-field-id',
  name: 'name',
  type: FieldMetadataType.TEXT,
  universalIdentifier: 'name-field-universal-id',
} as FlatFieldMetadata;

const companyObjectMetadata = {
  id: 'company-object-id',
  nameSingular: 'company',
  namePlural: 'companies',
  fieldIds: [nameField.id],
  universalIdentifier: 'company-object-universal-id',
} as FlatObjectMetadata;

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: { [nameField.universalIdentifier]: nameField },
  universalIdentifierById: { [nameField.id]: nameField.universalIdentifier },
  universalIdentifiersByApplicationId: {},
};

const internalContext = {
  flatFieldMetadataMaps,
  flatRowLevelPermissionPredicateMaps: {},
  flatRowLevelPermissionPredicateGroupMaps: {},
  userWorkspaceRoleMap: {},
  apiKeyRoleMap: {},
} as unknown as WorkspaceInternalContext;

const applyToFakeQueryBuilder = ({
  queryType = 'select',
  wheres = [],
}: {
  queryType?: string;
  wheres?: unknown[];
} = {}) => {
  const recorder = createWhereExpressionRecorder();
  const queryBuilder = Object.assign(recorder.whereExpression, {
    expressionMap: { queryType, wheres },
    objectRecordsPermissions: {},
  }) as unknown as WorkspaceSelectQueryBuilder<ObjectLiteral>;

  applyRowLevelPermissionPredicates({
    queryBuilder,
    objectMetadata: companyObjectMetadata,
    internalContext,
    authContext: {} as WorkspaceAuthContext,
    featureFlagMap: {} as FeatureFlagMap,
  });

  return recorder.calls;
};

const getFirstLeafSql = (calls: ReturnType<typeof applyToFakeQueryBuilder>) => {
  const groupNode = calls[0].node;

  if (groupNode.kind !== 'brackets') {
    throw new Error('Expected the record filter to be wrapped in brackets');
  }

  const leafNode = groupNode.children[0].node;

  if (leafNode.kind !== 'sql') {
    throw new Error('Expected a sql leaf');
  }

  return leafNode.sql;
};

describe('applyRowLevelPermissionPredicates', () => {
  beforeEach(() => {
    (buildRowLevelPermissionRecordFilter as jest.Mock).mockReturnValue({
      name: { ilike: '%Visible%' },
    });
  });

  it('uses where when the query builder has no existing where clause', () => {
    const calls = applyToFakeQueryBuilder({ wheres: [] });

    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('where');
    expect(calls[0].node.kind).toBe('brackets');
  });

  it('appends with andWhere so it never resets an existing where clause', () => {
    const calls = applyToFakeQueryBuilder({ wheres: [{ type: 'simple' }] });

    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('andWhere');
  });

  it('references the column through the table alias for a select query', () => {
    expect(
      getFirstLeafSql(applyToFakeQueryBuilder({ queryType: 'select' })),
    ).toContain('"company"."name"');
  });

  it.each(['update', 'delete', 'soft-delete'])(
    'references the column directly for a %s query',
    (queryType) => {
      const sql = getFirstLeafSql(applyToFakeQueryBuilder({ queryType }));

      expect(sql).toContain('"name"');
      expect(sql).not.toContain('"company"."name"');
    },
  );

  it('emits nothing when there is no record filter', () => {
    (buildRowLevelPermissionRecordFilter as jest.Mock).mockReturnValue(null);

    expect(applyToFakeQueryBuilder()).toEqual([]);
  });

  it('emits nothing when the record filter is empty', () => {
    (buildRowLevelPermissionRecordFilter as jest.Mock).mockReturnValue({});

    expect(applyToFakeQueryBuilder()).toEqual([]);
  });
});
