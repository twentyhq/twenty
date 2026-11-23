import { type FieldMetadataType } from 'twenty-shared/types';

import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

export type WorkspaceColumnShape = {
  columnName: string;
  fieldMetadataId: string;
  fieldName: string;
  fieldMetadataType: FieldMetadataType;
  compositeParentFieldName?: string;
};

export type WorkspaceRelationShape = {
  fieldName: string;
  fieldMetadataId: string;
  relationType: RelationType;
  targetObjectMetadataId: string;
  targetFieldMetadataId: string | null;
  joinColumnName?: string;
};

export type WorkspaceComputedLookupShape = {
  alias: string;
  relationFieldName: string;
};

// A column whose value is an expression over the record (COMPUTED_COLUMN_RECORD_ALIAS) and its lookups
export type WorkspaceComputedColumnShape = {
  columnName: string;
  sqlType: string;
  // Undefined when the value cannot be computed, so the column reads as NULL
  expression?: string;
  dependencies: { alias: string; fieldMetadataId: string }[];
};

export type WorkspaceTableShape = {
  objectMetadataId: string;
  nameSingular: string;
  schemaName: string;
  tableName: string;
  columnShapeByColumnName: Record<string, WorkspaceColumnShape>;
  columnNames: string[];
  relationShapeByFieldName: Record<string, WorkspaceRelationShape>;
  hasDeletedAtColumn: boolean;
  computedColumnShapes?: WorkspaceComputedColumnShape[];
  computedLookupShapes?: WorkspaceComputedLookupShape[];
};
