import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export enum IndexType {
  BTREE = 'BTREE',
  GIN = 'GIN',
}

@Unique('IndexOnNameAndWorkspaceIdAndObjectMetadataUnique', [
  'name',
  'workspaceId',
  'objectMetadataId',
])
@Entity('indexMetadata')
export class IndexMetadataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  workspaceId: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, (object) => object.indexMetadatas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  objectMetadata: Relation<ObjectMetadataEntity>;

  @OneToMany(
    () => IndexFieldMetadataEntity,
    (indexFieldMetadata: IndexFieldMetadataEntity) =>
      indexFieldMetadata.indexMetadata,
    {
      cascade: true,
    },
  )
  indexFieldMetadatas: Relation<IndexFieldMetadataEntity[]>;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ nullable: false, default: false })
  isUnique: boolean;

  @Column({ type: 'text', nullable: true })
  indexWhereClause: string | null;

  @Column({
    type: 'enum',
    enum: IndexType,
    default: IndexType.BTREE,
    nullable: false,
  })
  indexType?: IndexType;
}
