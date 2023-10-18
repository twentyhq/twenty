import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type TenantMigrationColumnAction = {
  name: string;
  type: string;
  action: 'create';
};

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
