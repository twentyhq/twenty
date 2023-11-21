import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum WorkspaceMigrationColumnActionType {
  CREATE = 'CREATE',
  RELATION = 'RELATION',
}

export type WorkspaceMigrationColumnCreate = {
  action: WorkspaceMigrationColumnActionType.CREATE;
  columnName: string;
  columnType: string;
  defaultValue?: any;
};

export type WorkspaceMigrationColumnRelation = {
  action: WorkspaceMigrationColumnActionType.RELATION;
  columnName: string;
  referencedTableName: string;
  referencedTableColumnName: string;
  isUnique?: boolean;
};

export type WorkspaceMigrationColumnAction = {
  action: WorkspaceMigrationColumnActionType;
} & (WorkspaceMigrationColumnCreate | WorkspaceMigrationColumnRelation);

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

  @Column()
  workspaceId: string;

  @CreateDateColumn()
  createdAt: Date;
}
