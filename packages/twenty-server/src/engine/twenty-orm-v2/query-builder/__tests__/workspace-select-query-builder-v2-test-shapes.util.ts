import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

export const SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

export const buildColumn = (
  columnName: string,
  compositeParentFieldName?: string,
) => ({
  columnName,
  fieldMetadataId: `field-${columnName}`,
  fieldName: compositeParentFieldName ?? columnName,
  fieldMetadataType: FieldMetadataType.TEXT,
  ...(compositeParentFieldName !== undefined
    ? { compositeParentFieldName }
    : {}),
});

export const companyTableShape: WorkspaceTableShape = {
  objectMetadataId: 'company-object-id',
  nameSingular: 'company',
  schemaName: SCHEMA_NAME,
  tableName: 'company',
  columnShapeByColumnName: {
    id: buildColumn('id'),
    name: buildColumn('name'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: ['id', 'name', 'deletedAt'],
  relationShapeByFieldName: {
    person: {
      fieldName: 'person',
      fieldMetadataId: 'field-company',
      relationType: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: 'person-object-id',
      targetFieldMetadataId: 'field-people',
      joinColumnName: 'personId',
    },
  },
  hasDeletedAtColumn: true,
};

export const personTableShape: WorkspaceTableShape = {
  objectMetadataId: 'person-object-id',
  nameSingular: 'person',
  schemaName: SCHEMA_NAME,
  tableName: 'person',
  columnShapeByColumnName: {
    id: buildColumn('id'),
    nameFirstName: buildColumn('nameFirstName', 'name'),
    nameLastName: buildColumn('nameLastName', 'name'),
    companyId: buildColumn('companyId'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: [
    'id',
    'nameFirstName',
    'nameLastName',
    'companyId',
    'deletedAt',
  ],
  relationShapeByFieldName: {
    company: {
      fieldName: 'company',
      fieldMetadataId: 'field-company',
      relationType: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: 'company-object-id',
      targetFieldMetadataId: 'field-people',
      joinColumnName: 'companyId',
    },
    people: {
      fieldName: 'people',
      fieldMetadataId: 'field-people',
      relationType: RelationType.ONE_TO_MANY,
      targetObjectMetadataId: 'company-object-id',
      targetFieldMetadataId: 'field-company',
    },
  },
  hasDeletedAtColumn: true,
};

export const buildQueryBuilder = ({
  rows = [],
  tableShape = personTableShape,
}: {
  rows?: Record<string, unknown>[];
  tableShape?: WorkspaceTableShape;
} = {}) => {
  const executedStatements: CompiledStatement[] = [];

  const queryBuilder = new WorkspaceSelectQueryBuilderV2('person', {
    tableShape,
    executor: {
      execute: async (statement) => {
        executedStatements.push(statement);

        return rows;
      },
    },
    objectRecordsPermissions: {},
    tableShapeByObjectMetadataId: () => companyTableShape,
    onBeforeExecute: () => undefined,
    formatResult: (records) => records as never,
  });

  return { queryBuilder, executedStatements };
};
