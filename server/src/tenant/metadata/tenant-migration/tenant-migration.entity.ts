import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type TenantMigrationColumnChange = {
  name: string;
  type: string;
  change: 'create' | 'alter';
};

export type TenantMigrationTableChange = {
  name: string;
  change: 'create' | 'alter';
  columns?: TenantMigrationColumnChange[];
};

@Entity('tenant_migrations')
export class TenantMigration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'jsonb' })
  migrations: TenantMigrationTableChange[];

  @Column({ nullable: true, name: 'applied_at' })
  appliedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
