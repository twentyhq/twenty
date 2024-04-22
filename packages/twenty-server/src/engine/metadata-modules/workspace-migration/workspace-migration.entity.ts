import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export enum WorkspaceMigrationColumnActionType {
  CREATE = 'CREATE',
  ALTER = 'ALTER',
  CREATE_FOREIGN_KEY = 'CREATE_FOREIGN_KEY',
  DROP_FOREIGN_KEY = 'DROP_FOREIGN_KEY',
  DROP = 'DROP',
  CREATE_COMMENT = 'CREATE_COMMENT',
}

export type WorkspaceMigrationEnum = string | { from: string; to: string };

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

export type WorkspaceMigrationTableAction = {
  name: string;
  action: 'create' | 'alter' | 'drop';
  columns?: WorkspaceMigrationColumnAction[];
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
