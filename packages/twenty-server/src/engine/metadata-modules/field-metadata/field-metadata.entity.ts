import { FieldMetadataType } from 'twenty-shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

@Entity('fieldMetadata')
@Unique('IndexOnNameObjectMetadataIdAndWorkspaceIdUnique', [
  'name',
  'objectMetadataId',
  'workspaceId',
])
export class FieldMetadataEntity<
  T extends FieldMetadataType | 'default' = 'default',
> implements FieldMetadataInterface<T>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  standardId: string | null;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, (object) => object.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'objectMetadataId' })
  object: Relation<ObjectMetadataEntity>;

  @Column({
    nullable: false,
    type: 'varchar',
  })
  type: FieldMetadataType;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: true, type: 'jsonb' })
  defaultValue: FieldMetadataDefaultValue<T>;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column('jsonb', { nullable: true })
  options: FieldMetadataOptions<T>;

  @Column('jsonb', { nullable: true })
  settings?: FieldMetadataSettings<T>;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ nullable: true, default: true })
  isNullable: boolean;

  @Column({ nullable: true, default: false })
  isUnique: boolean;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ default: false })
  isLabelSyncedWithName: boolean;

  @OneToOne(
    () => RelationMetadataEntity,
    (relation: RelationMetadataEntity) => relation.fromFieldMetadata,
  )
  fromRelationMetadata: Relation<RelationMetadataEntity>;

  @OneToOne(
    () => RelationMetadataEntity,
    (relation: RelationMetadataEntity) => relation.toFieldMetadata,
  )
  toRelationMetadata: Relation<RelationMetadataEntity>;

  @OneToMany(
    () => IndexFieldMetadataEntity,
    (indexFieldMetadata: IndexFieldMetadataEntity) =>
      indexFieldMetadata.indexMetadata,
    {
      cascade: true,
    },
  )
  indexFieldMetadatas: Relation<IndexFieldMetadataEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
