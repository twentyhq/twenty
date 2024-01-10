import { WorkspaceTableStructure } from 'src/workspace/workspace-health/interfaces/workspace-table-definition.interface';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

export enum WorkspaceHealthIssueType {
  MISSING_TABLE = 'MISSING_TABLE',
  TABLE_CONFLICT = 'TABLE_CONFLICT',
  MISSING_COLUMN = 'MISSING_COLUMN',
  MISSING_INDEX = 'MISSING_INDEX',
  MISSING_FOREIGN_KEY = 'MISSING_FOREIGN_KEY',
  MISSING_COMPOSITE_TYPE = 'MISSING_COMPOSITE_TYPE',
  COLUMN_CONFLICT = 'COLUMN_CONFLICT',
}

export interface WorkspaceHealthTableIssue {
  type:
    | WorkspaceHealthIssueType.MISSING_TABLE
    | WorkspaceHealthIssueType.TABLE_CONFLICT;
  objectMetadata: ObjectMetadataEntity;
  message: string;
}

export interface WorkspaceHealthColumnIssue {
  type:
    | WorkspaceHealthIssueType.MISSING_COLUMN
    | WorkspaceHealthIssueType.MISSING_INDEX
    | WorkspaceHealthIssueType.MISSING_FOREIGN_KEY
    | WorkspaceHealthIssueType.MISSING_COMPOSITE_TYPE
    | WorkspaceHealthIssueType.COLUMN_CONFLICT;
  fieldMetadata: FieldMetadataEntity;
  columnStructure?: WorkspaceTableStructure;
  message: string;
}

export type WorkspaceHealthIssue =
  | WorkspaceHealthTableIssue
  | WorkspaceHealthColumnIssue;
