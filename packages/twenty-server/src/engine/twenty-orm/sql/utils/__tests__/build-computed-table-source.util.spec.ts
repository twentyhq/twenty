import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  buildComputedTableSource,
  type ComputedTableSourcePermissions,
} from 'src/engine/twenty-orm/sql/utils/build-computed-table-source.util';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

const buildTableShape = ({
  nameSingular,
  columnNames,
  overrides = {},
}: {
  nameSingular: string;
  columnNames: string[];
  overrides?: Partial<WorkspaceTableShape>;
}): WorkspaceTableShape => ({
  objectMetadataId: `${nameSingular}-object`,
  nameSingular,
  schemaName: 'workspace',
  tableName: nameSingular,
  columnShapeByColumnName: Object.fromEntries(
    columnNames.map((columnName) => [
      columnName,
      {
        columnName,
        fieldMetadataId: `${nameSingular}-${columnName}`,
        fieldName: columnName,
        fieldMetadataType: FieldMetadataType.TEXT,
      },
    ]),
  ),
  columnNames,
  relationShapeByFieldName: {},
  hasDeletedAtColumn: columnNames.includes('deletedAt'),
  ...overrides,
});

const SUPPLIER_TABLE_SHAPE = buildTableShape({
  nameSingular: 'supplier',
  columnNames: ['id', 'name', 'deletedAt'],
});

const GADGET_TABLE_SHAPE = buildTableShape({
  nameSingular: 'gadget',
  columnNames: ['id', 'price', 'supplierId', 'total', 'supplierLabel'],
  overrides: {
    relationShapeByFieldName: {
      supplier: {
        fieldName: 'supplier',
        fieldMetadataId: 'gadget-supplier',
        relationType: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: 'supplier-object',
        targetFieldMetadataId: null,
        joinColumnName: 'supplierId',
      },
    },
    computedLookupShapes: [{ alias: 'lookup0', relationFieldName: 'supplier' }],
    computedColumnShapes: [
      {
        columnName: 'total',
        sqlType: 'double precision',
        expression: '"record"."price" * 2',
        dependencies: [{ alias: 'record', fieldMetadataId: 'gadget-price' }],
      },
      {
        columnName: 'supplierLabel',
        sqlType: 'text',
        expression: 'upper("lookup0"."name")',
        dependencies: [
          { alias: 'record', fieldMetadataId: 'gadget-supplier' },
          { alias: 'lookup0', fieldMetadataId: 'supplier-name' },
        ],
      },
    ],
  },
});

const build = ({
  unreadableFieldMetadataIds = [],
  unreadableObjectMetadataIds = [],
  permissions,
}: {
  unreadableFieldMetadataIds?: string[];
  unreadableObjectMetadataIds?: string[];
  permissions?: ComputedTableSourcePermissions;
} = {}) => {
  const recordReadRestrictions: RecordReadRestrictions = {
    unreadableFieldMetadataIds: new Set(unreadableFieldMetadataIds),
    unreadableObjectMetadataIds: new Set(unreadableObjectMetadataIds),
  };

  return buildComputedTableSource({
    tableShape: GADGET_TABLE_SHAPE,
    getTableShape: () => SUPPLIER_TABLE_SHAPE,
    recordReadRestrictions,
    permissions,
  });
};

const STORED_COLUMNS = '"record"."id", "record"."price", "record"."supplierId"';
const FROM = 'FROM "workspace"."gadget" AS "record"';
const LOOKUP_JOIN =
  'LEFT JOIN "workspace"."supplier" AS "lookup0" ON "lookup0"."id" = "record"."supplierId" AND "lookup0"."deletedAt" IS NULL';
const TOTAL = '("record"."price" * 2)::double precision AS "total"';
const SUPPLIER_LABEL = '(upper("lookup0"."name"))::text AS "supplierLabel"';
const EMPTY_SUPPLIER_LABEL = 'NULL::text AS "supplierLabel"';

describe('buildComputedTableSource', () => {
  it('should not wrap a table without computed column', () => {
    expect(
      buildComputedTableSource({
        tableShape: SUPPLIER_TABLE_SHAPE,
        getTableShape: () => SUPPLIER_TABLE_SHAPE,
        recordReadRestrictions: {
          unreadableFieldMetadataIds: new Set(),
          unreadableObjectMetadataIds: new Set(),
        },
        permissions: undefined,
      }),
    ).toBeUndefined();
  });

  it('should select stored columns as they are and computed columns from their expression', () => {
    expect(build()).toBe(
      `(SELECT ${STORED_COLUMNS}, ${TOTAL}, ${SUPPLIER_LABEL} ${FROM} ${LOOKUP_JOIN})`,
    );
  });

  it('should select the access group ids column of a table that has one', () => {
    expect(
      buildComputedTableSource({
        tableShape: { ...GADGET_TABLE_SHAPE, hasAccessGroupIdsColumn: true },
        getTableShape: () => SUPPLIER_TABLE_SHAPE,
        recordReadRestrictions: {
          unreadableFieldMetadataIds: new Set(),
          unreadableObjectMetadataIds: new Set(),
        },
        permissions: undefined,
      }),
    ).toBe(
      `(SELECT ${STORED_COLUMNS}, "record"."_accessGroupIds", ${TOTAL}, ${SUPPLIER_LABEL} ${FROM} ${LOOKUP_JOIN})`,
    );
  });

  it('should only reach the related records the caller can read', () => {
    expect(
      build({
        permissions: {
          lookupAccessConditionByAlias: {
            lookup0: '"lookup0"."name" = :ownerName',
          },
          unreadableFieldConditions: [],
        },
      }),
    ).toBe(
      `(SELECT ${STORED_COLUMNS}, ${TOTAL}, ${SUPPLIER_LABEL} ${FROM} ${LOOKUP_JOIN} AND ("lookup0"."name" = :ownerName))`,
    );
  });

  it.each([
    {
      reason: 'the target field is unreadable',
      restrictions: { unreadableFieldMetadataIds: ['supplier-name'] },
    },
    {
      reason: 'the relation field is unreadable',
      restrictions: { unreadableFieldMetadataIds: ['gadget-supplier'] },
    },
    {
      reason: 'the related object is unreadable',
      restrictions: { unreadableObjectMetadataIds: ['supplier-object'] },
    },
    {
      reason: 'no related record can be read',
      restrictions: {
        permissions: {
          lookupAccessConditionByAlias: { lookup0: false as const },
          unreadableFieldConditions: [],
        },
      },
    },
  ])(
    'should read a lookup as NULL, without joining, when $reason',
    ({ restrictions }) => {
      expect(build(restrictions)).toBe(
        `(SELECT ${STORED_COLUMNS}, ${TOTAL}, ${EMPTY_SUPPLIER_LABEL} ${FROM})`,
      );
    },
  );

  it('should read a column as NULL on the rows where a field it reads is hidden', () => {
    expect(
      build({
        permissions: {
          lookupAccessConditionByAlias: {},
          unreadableFieldConditions: [
            {
              alias: 'record',
              fieldMetadataIds: ['gadget-price'],
              condition: '"record"."price" > 100',
            },
            {
              alias: 'lookup0',
              fieldMetadataIds: ['supplier-other'],
              condition: 'TRUE',
            },
          ],
        },
      }),
    ).toBe(
      `(SELECT ${STORED_COLUMNS}, (CASE WHEN ("record"."price" > 100) THEN NULL ELSE "record"."price" * 2 END)::double precision AS "total", ${SUPPLIER_LABEL} ${FROM} ${LOOKUP_JOIN})`,
    );
  });
});
