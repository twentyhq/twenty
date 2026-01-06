import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

@Unique('IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE', [
  'name',
  'workspaceId',
  'objectMetadataId',
])
@Index('IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID', [
  'workspaceId',
  'objectMetadataId',
])
@Entity('indexMetadata')
export class IndexMetadataEntity
  extends SyncableEntity
  implements Required<IndexMetadataEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false })
  name: string;

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
  indexType: IndexType;
}
