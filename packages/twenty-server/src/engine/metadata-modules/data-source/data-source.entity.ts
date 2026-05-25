import {
  Column,
  CreateDateColumn,
  type DataSourceOptions,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

export type DataSourceType = DataSourceOptions['type'];

// @deprecated - This entity is kept only to preserve the dataSource table.
// All code should use workspace.databaseSchema instead.
@Entity('dataSource')
@Index('IDX_DATA_SOURCE_WORKSPACE_ID_CREATED_AT', ['workspaceId', 'createdAt'])
export class DataSourceEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  label: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  schema: string;

  @Column({ type: 'enum', enum: ['postgres'], default: 'postgres' })
  type: DataSourceType;

  @Column({ default: false })
  isRemote: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
