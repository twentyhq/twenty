import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type TenantMigrationColumnCreate = {
  action: 'create';
  columnName: string;
  columnType: string;
};

export type TenantMigrationColumnRelation = {
  action: 'relation';
  columnName: string;
  referencedTableName: string;
  referencedTableColumnName: string;
};

export type TenantMigrationColumnAction =
  | TenantMigrationColumnCreate
  | TenantMigrationColumnRelation;

export type TenantMigrationTableAction = {
  name: string;
  action: 'create' | 'alter';
  columns?: TenantMigrationColumnAction[];
};
@Entity('tenant_migrations')
export class TenantMigration {
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
