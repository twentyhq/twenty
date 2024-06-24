import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Relation,
  OneToMany,
} from 'typeorm';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-field-metadata/index-field-metadata.entity';

export enum FieldMetadataType {
  UUID = 'UUID',
  TEXT = 'TEXT',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  DATE_TIME = 'DATE_TIME',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  NUMBER = 'NUMBER',
  NUMERIC = 'NUMERIC',
  PROBABILITY = 'PROBABILITY',
  LINK = 'LINK',
  LINKS = 'LINKS',
  CURRENCY = 'CURRENCY',
  FULL_NAME = 'FULL_NAME',
  RATING = 'RATING',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  RELATION = 'RELATION',
  POSITION = 'POSITION',
  ADDRESS = 'ADDRESS',
  RAW_JSON = 'RAW_JSON',
}

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

  @Column({ nullable: false })
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

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

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
      indexFieldMetadata.fieldMetadata,
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
