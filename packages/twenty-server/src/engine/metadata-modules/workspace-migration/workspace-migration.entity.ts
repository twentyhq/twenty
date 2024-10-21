import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export enum WorkspaceMigrationColumnActionType {
  CREATE = 'CREATE',
  ALTER = 'ALTER',
  CREATE_FOREIGN_KEY = 'CREATE_FOREIGN_KEY',
  DROP_FOREIGN_KEY = 'DROP_FOREIGN_KEY',
  DROP = 'DROP',
  CREATE_COMMENT = 'CREATE_COMMENT',
}
export type WorkspaceMigrationRenamedEnum = { from: string; to: string };
export type WorkspaceMigrationEnum = string | WorkspaceMigrationRenamedEnum;

export enum WorkspaceMigrationIndexActionType {
  CREATE = 'CREATE',
  DROP = 'DROP',
}

export interface WorkspaceMigrationColumnDefinition {
  columnName: string;
  columnType: string;
  enum?: WorkspaceMigrationEnum[];
  isArray?: boolean;
  isNullable: boolean;
  isUnique?: boolean;
  defaultValue: any;
  generatedType?: 'STORED' | 'VIRTUAL';
  asExpression?: string;
}

export interface WorkspaceMigrationIndexAction {
  action: WorkspaceMigrationIndexActionType;
  name: string;
  columns: string[];
  isUnique: boolean;
  where?: string | null;
  type?: IndexType;
}

export interface WorkspaceMigrationColumnCreate
  extends WorkspaceMigrationColumnDefinition {
  action: WorkspaceMigrationColumnActionType.CREATE;
}

export type WorkspaceMigrationColumnAlter = {
  action: WorkspaceMigrationColumnActionType.ALTER;
  currentColumnDefinition: WorkspaceMigrationColumnDefinition;
  alteredColumnDefinition: WorkspaceMigrationColumnDefinition;
};

export type WorkspaceMigrationColumnCreateRelation = {
  action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY;
  columnName: string;
  referencedTableName: string;
  referencedTableColumnName: string;
  isUnique?: boolean;
  onDelete?: RelationOnDeleteAction;
};

export type WorkspaceMigrationColumnDropRelation = {
  action: WorkspaceMigrationColumnActionType.DROP_FOREIGN_KEY;
  columnName: string;
};

export type WorkspaceMigrationColumnDrop = {
  action: WorkspaceMigrationColumnActionType.DROP;
  columnName: string;
};

export type WorkspaceMigrationCreateComment = {
  action: WorkspaceMigrationColumnActionType.CREATE_COMMENT;
  comment: string;
};

export type WorkspaceMigrationForeignColumnDefinition =
  WorkspaceMigrationColumnDefinition & {
    distantColumnName: string;
  };

type ReferencedObject = {
  object: string;
};

type ReferencedTableWithSchema = {
  table_name: string;
  schema_name: string;
};

export type ReferencedTable = ReferencedObject | ReferencedTableWithSchema;

export type WorkspaceMigrationForeignTable = {
  columns: WorkspaceMigrationForeignColumnDefinition[];
  referencedTable: ReferencedObject | ReferencedTableWithSchema;
  foreignDataWrapperId: string;
};

export type WorkspaceMigrationColumnAction = {
  action: WorkspaceMigrationColumnActionType;
} & (
  | WorkspaceMigrationColumnCreate
  | WorkspaceMigrationColumnAlter
  | WorkspaceMigrationColumnCreateRelation
  | WorkspaceMigrationColumnDropRelation
  | WorkspaceMigrationColumnDrop
  | WorkspaceMigrationCreateComment
);

/**
 * Enum values are lowercase to avoid issues with already existing enum values
 */
export enum WorkspaceMigrationTableActionType {
  CREATE = 'create',
  ALTER = 'alter',
  DROP = 'drop',
  CREATE_FOREIGN_TABLE = 'create_foreign_table',
  DROP_FOREIGN_TABLE = 'drop_foreign_table',
  ALTER_FOREIGN_TABLE = 'alter_foreign_table',
  ALTER_INDEXES = 'alter_indexes',
}

export type WorkspaceMigrationTableAction = {
  name: string;
  newName?: string;
  action: WorkspaceMigrationTableActionType;
  columns?: WorkspaceMigrationColumnAction[];
  foreignTable?: WorkspaceMigrationForeignTable;
  indexes?: WorkspaceMigrationIndexAction[];
};

@Entity('workspaceMigration')
export class WorkspaceMigrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'jsonb' })
  migrations: WorkspaceMigrationTableAction[];

  @Column({ nullable: false })
  name: string;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  appliedAt?: Date;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
