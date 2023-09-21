import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type MigrationColumn = {
  name: string;
  type: string;
  change: 'create' | 'alter';
};

export type Migration = {
  name: string;
  change: 'create' | 'alter';
  columns?: MigrationColumn[];
};

@Entity('tenant_migrations')
export class TenantMigration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'jsonb' })
  migrations: Migration[];

  @Column({ nullable: true, name: 'applied_at' })
  appliedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
