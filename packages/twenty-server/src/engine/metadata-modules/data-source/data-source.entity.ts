import {
  Column,
  CreateDateColumn,
  DataSourceOptions,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export type DataSourceType = DataSourceOptions['type'];

@Entity('dataSource')
@Index('IDX_DATA_SOURCE_WORKSPACE_ID_CREATED_AT', ['workspaceId', 'createdAt'])
export class DataSourceEntity {
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

  @OneToMany(() => ObjectMetadataEntity, (object) => object.dataSource, {
    cascade: true,
  })
  objects: ObjectMetadataEntity[];

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
