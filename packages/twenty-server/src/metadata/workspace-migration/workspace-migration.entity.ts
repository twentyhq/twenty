import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum WorkspaceMigrationColumnActionType {
  CREATE = 'CREATE',
  ALTER = 'ALTER',
  RELATION = 'RELATION',
  DROP = 'DROP',
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

export type WorkspaceMigrationColumnRelation = {
  action: WorkspaceMigrationColumnActionType.RELATION;
  columnName: string;
  referencedTableName: string;
  referencedTableColumnName: string;
  isUnique?: boolean;
};

export type WorkspaceMigrationColumnDrop = {
  action: WorkspaceMigrationColumnActionType.DROP;
  columnName: string;
};

export type WorkspaceMigrationColumnAction = {
  action: WorkspaceMigrationColumnActionType;
} & (
  | WorkspaceMigrationColumnCreate
  | WorkspaceMigrationColumnAlter
  | WorkspaceMigrationColumnRelation
  | WorkspaceMigrationColumnDrop
);

export type WorkspaceMigrationTableAction = {
  name: string;
  action: 'create' | 'alter';
  columns?: WorkspaceMigrationColumnAction[];
};

@Entity('workspaceMigration')
export class WorkspaceMigrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'jsonb' })
  migrations: WorkspaceMigrationTableAction[];

  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ nullable: true })
  appliedAt?: Date;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn()
  createdAt: Date;
}
