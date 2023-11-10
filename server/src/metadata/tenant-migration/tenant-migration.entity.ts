import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TenantMigrationColumnActionType {
  CREATE = 'CREATE',
  RELATION = 'RELATION',
}

export type TenantMigrationColumnCreate = {
  action: TenantMigrationColumnActionType.CREATE;
  columnName: string;
  columnType: string;
};

export type TenantMigrationColumnRelation = {
  action: TenantMigrationColumnActionType.RELATION;
  columnName: string;
  referencedTableName: string;
  referencedTableColumnName: string;
};

export type TenantMigrationColumnAction = {
  action: TenantMigrationColumnActionType;
} & (TenantMigrationColumnCreate | TenantMigrationColumnRelation);

export type TenantMigrationTableAction = {
  name: string;
  action: 'create' | 'alter';
  columns?: TenantMigrationColumnAction[];
};
@Entity('tenantMigration')
export class TenantMigrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'jsonb' })
  migrations: TenantMigrationTableAction[];

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
