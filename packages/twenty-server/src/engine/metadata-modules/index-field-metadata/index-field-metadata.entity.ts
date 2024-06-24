import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Relation,
} from 'typeorm';

import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Entity('indexFieldMetadata')
export class IndexFieldMetadataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  indexMetadataId: string;

  @ManyToOne(
    () => IndexMetadataEntity,
    (indexMetadata) => indexMetadata.indexFieldMetadatas,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  indexMetadata: Relation<IndexMetadataEntity>;

  @Column({ nullable: false })
  fieldMetadataId: string;

  @ManyToOne(
    () => FieldMetadataEntity,
    (fieldMetadata) => fieldMetadata.indexFieldMetadatas,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  fieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: false })
  order: number;
}
