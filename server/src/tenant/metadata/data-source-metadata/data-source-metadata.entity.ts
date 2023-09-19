import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DataSourceOptions,
} from 'typeorm';

type DataSourceType = DataSourceOptions['type'];

@Entity('data_source_metadata')
export class DataSourceMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  schema: string;

  @Column({ type: 'enum', enum: ['postgres'], default: 'postgres' })
  type: DataSourceType;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false, name: 'is_remote' })
  isRemote: boolean;

  @Column({ nullable: false, name: 'workspace_id' })
  workspaceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
