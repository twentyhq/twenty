import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export enum WorkspaceMigrationColumnActionType {
  ALTER = 'ALTER',
  CREATE = 'CREATE',
  CREATE_COMMENT = 'CREATE_COMMENT',
  CREATE_FOREIGN_KEY = 'CREATE_FOREIGN_KEY',
  DROP = 'DROP',
  DROP_FOREIGN_KEY = 'DROP_FOREIGN_KEY',
}
export type WorkspaceMigrationRenamedEnum = { from: string; to: string };
export type WorkspaceMigrationEnum = string | WorkspaceMigrationRenamedEnum;

export interface WorkspaceMigrationColumnDefinition {
  columnName: string;
  columnType: string;
  enum?: WorkspaceMigrationEnum[];
  isArray?: boolean;
  isNullable?: boolean;
  defaultValue?: any;
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
  foreignName: string;
  localName: string;
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

export type WorkspaceMigrationForeignTable = {
  columns: WorkspaceMigrationColumnDefinition[];
  referencedTableName: string;
  referencedTableSchema: string;
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
}

export type WorkspaceMigrationTableAction = {
  name: string;
  newName?: string;
  action: WorkspaceMigrationTableActionType;
  columns?: WorkspaceMigrationColumnAction[];
  foreignTable?: WorkspaceMigrationForeignTable;
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
