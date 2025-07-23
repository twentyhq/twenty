import { FieldMetadataType } from 'twenty-shared/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import { AssignTypeIfIsRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/assign-type-if-is-relation-field-metadata-type.type';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';

@Entity('fieldMetadata')
@Index(
  'IDX_FIELD_METADATA_NAME_OBJMID_WORKSPACE_ID_EXCEPT_MORPH_UNIQUE',
  ['name', 'objectMetadataId', 'workspaceId'],
  {
    unique: true,
    where: `"type" <> ''MORPH_RELATION''`,
  },
)
@Index('IDX_FIELD_METADATA_RELATION_TARGET_FIELD_METADATA_ID', [
  'relationTargetFieldMetadataId',
])
@Index('IDX_FIELD_METADATA_RELATION_TARGET_OBJECT_METADATA_ID', [
  'relationTargetObjectMetadataId',
])
@Index('IDX_FIELD_METADATA_OBJECT_METADATA_ID_WORKSPACE_ID', [
  'objectMetadataId',
  'workspaceId',
])
// TODO add some documentation about this entity
export class FieldMetadataEntity<
  T extends FieldMetadataType = FieldMetadataType,
> implements Required<FieldMetadataEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  standardId: string | null;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, (object) => object.fields, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'objectMetadataId' })
  @Index('IDX_FIELD_METADATA_OBJECT_METADATA_ID', ['objectMetadataId'])
  object: Relation<ObjectMetadataEntity>;

  @Column({
    nullable: false,
    type: 'varchar',
  })
  type: T;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: true, type: 'jsonb' })
  defaultValue: FieldMetadataDefaultValue<T>;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ type: 'jsonb', nullable: true })
  standardOverrides: FieldStandardOverridesDTO | null;

  @Column('jsonb', { nullable: true })
  options: FieldMetadataOptions<T>;

  @Column('jsonb', { nullable: true })
  settings: FieldMetadataSettings<T>;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean;

  // Is this really nullable ?
  @Column({ nullable: true, default: true, type: 'boolean' })
  isNullable: boolean | null;

  // Is this really nullable ?
  @Column({ nullable: true, default: false, type: 'boolean' })
  isUnique: boolean | null;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_FIELD_METADATA_WORKSPACE_ID', ['workspaceId'])
  workspaceId: string;

  @Column({ default: false })
  isLabelSyncedWithName: boolean;

  @Column({ nullable: true, type: 'uuid' })
  relationTargetFieldMetadataId: AssignTypeIfIsRelationFieldMetadataType<
    string,
    T
  >;

  @OneToOne(
    () => FieldMetadataEntity,
    (fieldMetadata: FieldMetadataEntity) =>
      fieldMetadata.relationTargetFieldMetadataId,
    { nullable: true },
  )
  @JoinColumn({ name: 'relationTargetFieldMetadataId' })
  relationTargetFieldMetadata: AssignTypeIfIsRelationFieldMetadataType<
    Relation<FieldMetadataEntity>,
    T
  >;

  @Column({ nullable: true, type: 'uuid' })
  relationTargetObjectMetadataId: AssignTypeIfIsRelationFieldMetadataType<
    string,
    T
  >;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (objectMetadata: ObjectMetadataEntity) =>
      objectMetadata.targetRelationFields,
    { onDelete: 'CASCADE', nullable: true },
  )
  @JoinColumn({ name: 'relationTargetObjectMetadataId' })
  relationTargetObjectMetadata: AssignTypeIfIsRelationFieldMetadataType<
    Relation<ObjectMetadataEntity>,
    T
  >;

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

  @OneToMany(
    () => FieldPermissionEntity,
    (fieldPermission: FieldPermissionEntity) => fieldPermission.fieldMetadata,
  )
  fieldPermissions: Relation<FieldPermissionEntity[]>;
}
