import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DataSourceOptions,
  OneToMany,
} from 'typeorm';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

type DataSourceType = DataSourceOptions['type'];

@Entity('dataSource')
export class DataSourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  schema: string;

  @Column({ type: 'enum', enum: ['postgres'], default: 'postgres' })
  type: DataSourceType;

  @Column({ nullable: true, name: 'label' })
  label: string;

  @Column({ default: false })
  isRemote: boolean;

  @OneToMany(() => ObjectMetadataEntity, (object) => object.dataSource, {
    cascade: true,
  })
  objects: ObjectMetadataEntity[];

  @Column({ nullable: false })
  workspaceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
