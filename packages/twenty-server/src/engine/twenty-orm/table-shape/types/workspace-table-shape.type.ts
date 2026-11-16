import { type FieldMetadataType } from 'twenty-shared/types';

import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

export type WorkspaceColumnShape = {
  columnName: string;
  fieldMetadataId: string;
  fieldName: string;
  fieldMetadataType: FieldMetadataType;
  compositeParentFieldName?: string;
  // Not stored: its value is an SQL expression supplied when a query references it
  isComputed?: true;
};

export type WorkspaceRelationShape = {
  fieldName: string;
  fieldMetadataId: string;
  relationType: RelationType;
  targetObjectMetadataId: string;
  targetFieldMetadataId: string | null;
  joinColumnName?: string;
};

export type WorkspaceTableShape = {
  objectMetadataId: string;
  nameSingular: string;
  schemaName: string;
  tableName: string;
  columnShapeByColumnName: Record<string, WorkspaceColumnShape>;
  // The default projection and writes never touch computed columns
  storedColumnNames: string[];
  computedColumnNames: string[];
  relationShapeByFieldName: Record<string, WorkspaceRelationShape>;
  hasDeletedAtColumn: boolean;
};
