import { WorkspaceTableStructure } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-table-definition.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export enum WorkspaceHealthIssueType {
  MISSING_TABLE = 'MISSING_TABLE',
  TABLE_NAME_SHOULD_BE_CUSTOM = 'TABLE_NAME_SHOULD_BE_CUSTOM',
  TABLE_TARGET_TABLE_NAME_NOT_VALID = 'TABLE_TARGET_TABLE_NAME_NOT_VALID',
  TABLE_DATA_SOURCE_ID_NOT_VALID = 'TABLE_DATA_SOURCE_ID_NOT_VALID',
  TABLE_NAME_NOT_VALID = 'TABLE_NAME_NOT_VALID',
  MISSING_COLUMN = 'MISSING_COLUMN',
  MISSING_INDEX = 'MISSING_INDEX',
  MISSING_FOREIGN_KEY = 'MISSING_FOREIGN_KEY',
  MISSING_COMPOSITE_TYPE = 'MISSING_COMPOSITE_TYPE',
  COLUMN_NAME_SHOULD_NOT_BE_PREFIXED = 'COLUMN_NAME_SHOULD_NOT_BE_PREFIXED',
  COLUMN_NAME_SHOULD_NOT_BE_CUSTOM = 'COLUMN_NAME_SHOULD_NOT_BE_CUSTOM',
  COLUMN_OBJECT_REFERENCE_INVALID = 'COLUMN_OBJECT_REFERENCE_INVALID',
  COLUMN_NAME_NOT_VALID = 'COLUMN_NAME_NOT_VALID',
  COLUMN_TYPE_NOT_VALID = 'COLUMN_TYPE_NOT_VALID',
  COLUMN_DATA_TYPE_CONFLICT = 'COLUMN_DATA_TYPE_CONFLICT',
  COLUMN_NULLABILITY_CONFLICT = 'COLUMN_NULLABILITY_CONFLICT',
  COLUMN_DEFAULT_VALUE_CONFLICT = 'COLUMN_DEFAULT_VALUE_CONFLICT',
  COLUMN_DEFAULT_VALUE_NOT_VALID = 'COLUMN_DEFAULT_VALUE_NOT_VALID',
  COLUMN_OPTIONS_NOT_VALID = 'COLUMN_OPTIONS_NOT_VALID',
  RELATION_METADATA_NOT_VALID = 'RELATION_METADATA_NOT_VALID',
  RELATION_FROM_OR_TO_FIELD_METADATA_NOT_VALID = 'RELATION_FROM_OR_TO_FIELD_METADATA_NOT_VALID',
  RELATION_FOREIGN_KEY_NOT_VALID = 'RELATION_FOREIGN_KEY_NOT_VALID',
  RELATION_FOREIGN_KEY_CONFLICT = 'RELATION_FOREIGN_KEY_CONFLICT',
  RELATION_FOREIGN_KEY_ON_DELETE_ACTION_CONFLICT = 'RELATION_FOREIGN_KEY_ON_DELETE_ACTION_CONFLICT',
  RELATION_TYPE_NOT_VALID = 'RELATION_TYPE_NOT_VALID',
}

/**
 * Table issues
 */
export type WorkspaceTableIssueTypes =
  | WorkspaceHealthIssueType.MISSING_TABLE
  | WorkspaceHealthIssueType.TABLE_NAME_SHOULD_BE_CUSTOM
  | WorkspaceHealthIssueType.TABLE_TARGET_TABLE_NAME_NOT_VALID
  | WorkspaceHealthIssueType.TABLE_DATA_SOURCE_ID_NOT_VALID
  | WorkspaceHealthIssueType.TABLE_NAME_NOT_VALID;

export interface WorkspaceHealthTableIssue<T extends WorkspaceTableIssueTypes> {
  type: T;
  objectMetadata: ObjectMetadataEntity;
  message: string;
}

/**
 * Column issues
 */
export type WorkspaceColumnIssueTypes =
  | WorkspaceHealthIssueType.MISSING_COLUMN
  | WorkspaceHealthIssueType.MISSING_INDEX
  | WorkspaceHealthIssueType.MISSING_FOREIGN_KEY
  | WorkspaceHealthIssueType.MISSING_COMPOSITE_TYPE
  | WorkspaceHealthIssueType.COLUMN_NAME_SHOULD_NOT_BE_PREFIXED
  | WorkspaceHealthIssueType.COLUMN_NAME_SHOULD_NOT_BE_CUSTOM
  | WorkspaceHealthIssueType.COLUMN_OBJECT_REFERENCE_INVALID
  | WorkspaceHealthIssueType.COLUMN_NAME_NOT_VALID
  | WorkspaceHealthIssueType.COLUMN_TYPE_NOT_VALID
  | WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT
  | WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT
  | WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT
  | WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID
  | WorkspaceHealthIssueType.COLUMN_OPTIONS_NOT_VALID;

export interface WorkspaceHealthColumnIssue<
  T extends WorkspaceColumnIssueTypes,
> {
  type: T;
  fieldMetadata: FieldMetadataEntity;
  columnStructure?: WorkspaceTableStructure;
  columnStructures?: WorkspaceTableStructure[];
  message: string;
}

/**
 * Relation issues
 */
export type WorkspaceRelationIssueTypes =
  | WorkspaceHealthIssueType.RELATION_METADATA_NOT_VALID
  | WorkspaceHealthIssueType.RELATION_FROM_OR_TO_FIELD_METADATA_NOT_VALID
  | WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_NOT_VALID
  | WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_CONFLICT
  | WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_ON_DELETE_ACTION_CONFLICT
  | WorkspaceHealthIssueType.RELATION_TYPE_NOT_VALID;

export interface WorkspaceHealthRelationIssue<
  T extends WorkspaceRelationIssueTypes,
> {
  type: T;
  fromFieldMetadata?: FieldMetadataEntity | undefined;
  toFieldMetadata?: FieldMetadataEntity | undefined;
  relationMetadata?: RelationMetadataEntity;
  columnStructure?: WorkspaceTableStructure;
  message: string;
}

/**
 * Get the interface for the issue type
 */
export type WorkspaceIssueTypeToInterface<T extends WorkspaceHealthIssueType> =
  T extends WorkspaceTableIssueTypes
    ? WorkspaceHealthTableIssue<T>
    : T extends WorkspaceColumnIssueTypes
      ? WorkspaceHealthColumnIssue<T>
      : T extends WorkspaceRelationIssueTypes
        ? WorkspaceHealthRelationIssue<T>
        : never;

/**
 * Union of all issues
 */
export type WorkspaceHealthIssue =
  WorkspaceIssueTypeToInterface<WorkspaceHealthIssueType>;
