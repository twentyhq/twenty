import { type FieldMetadataType } from 'twenty-shared/types';

import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

export type WorkspaceColumnShape = {
  columnName: string;
  fieldMetadataId: string;
  fieldName: string;
  fieldMetadataType: FieldMetadataType;
  // Set when the column is one sub-column of a composite field (nameFirstName -> name)
  compositeParentFieldName?: string;
};

export type WorkspaceRelationShape = {
  fieldName: string;
  fieldMetadataId: string;
  relationType: RelationType;
  targetObjectMetadataId: string;
  targetFieldMetadataId: string | null;
  // Only set on the owning (many-to-one) side
  joinColumnName?: string;
};

// Everything ORM v2 needs to talk to one workspace table. Derived from field metadata,
// never from an ORM metadata graph: it holds no methods, no back-references and no cycles.
export type WorkspaceTableShape = {
  objectMetadataId: string;
  nameSingular: string;
  schemaName: string;
  tableName: string;
  columnShapeByColumnName: Record<string, WorkspaceColumnShape>;
  columnNames: string[];
  relationShapeByFieldName: Record<string, WorkspaceRelationShape>;
  fieldIdByName: Record<string, string>;
  fieldIdByJoinColumnName: Record<string, string>;
  hasDeletedAtColumn: boolean;
};
