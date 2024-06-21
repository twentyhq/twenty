import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Relation,
  OneToMany,
} from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-field-metadata/index-field-metadata.entity';

@Entity('indexMetadata')
export class IndexMetadataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  workspaceId: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, (object) => object.indexes, {
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
}
