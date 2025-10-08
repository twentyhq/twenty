import { FieldMetadataType } from 'twenty-shared/types';
import {
  Check,
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
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { type FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import { AssignIfIsGivenFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/assign-if-is-given-field-metadata-type.type';
import { AssignTypeIfIsMorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/assign-type-if-is-morph-or-relation-field-metadata-type.type';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';

@Entity('fieldMetadata')
@Check(
  'CHK_FIELD_METADATA_MORPH_RELATION_REQUIRES_MORPH_ID',
  `("type" != 'MORPH_RELATION') OR ("type" = 'MORPH_RELATION' AND "morphId" IS NOT NULL)`,
)
@Index('IDX_FIELD_METADATA_RELATION_TARGET_FIELD_METADATA_ID', [
  'relationTargetFieldMetadataId',
])
@Index('IDX_FIELD_METADATA_RELATION_TARGET_OBJECT_METADATA_ID', [
  'relationTargetObjectMetadataId',
])
@Unique('IDX_FIELD_METADATA_NAME_OBJECT_METADATA_ID_WORKSPACE_ID_UNIQUE', [
  'name',
  'objectMetadataId',
  'workspaceId',
])
@Index('IDX_FIELD_METADATA_OBJECT_METADATA_ID_WORKSPACE_ID', [
  'objectMetadataId',
  'workspaceId',
])
// TODO add some documentation about this entity
export class FieldMetadataEntity<
  TFieldMetadataType extends FieldMetadataType = FieldMetadataType,
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
  type: TFieldMetadataType;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: true, type: 'jsonb' })
  defaultValue: FieldMetadataDefaultValue<TFieldMetadataType>;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ type: 'jsonb', nullable: true })
  standardOverrides: FieldStandardOverridesDTO | null;

  @Column('jsonb', { nullable: true })
  options: FieldMetadataOptions<TFieldMetadataType>;

  @Column('jsonb', { nullable: true })
  settings: FieldMetadataSettings<TFieldMetadataType>;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ default: false })
  isUIReadOnly: boolean;

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
  relationTargetFieldMetadataId: AssignTypeIfIsMorphOrRelationFieldMetadataType<
    string,
    TFieldMetadataType
  >;

  @OneToOne(
    () => FieldMetadataEntity,
    (fieldMetadata: FieldMetadataEntity) =>
      fieldMetadata.relationTargetFieldMetadataId,
    { nullable: true },
  )
  @JoinColumn({ name: 'relationTargetFieldMetadataId' })
  relationTargetFieldMetadata: AssignTypeIfIsMorphOrRelationFieldMetadataType<
    Relation<FieldMetadataEntity>,
    TFieldMetadataType
  >;

  @Column({ nullable: true, type: 'uuid' })
  relationTargetObjectMetadataId: AssignTypeIfIsMorphOrRelationFieldMetadataType<
    string,
    TFieldMetadataType
  >;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (objectMetadata: ObjectMetadataEntity) =>
      objectMetadata.targetRelationFields,
    { onDelete: 'CASCADE', nullable: true },
  )
  @JoinColumn({ name: 'relationTargetObjectMetadataId' })
  relationTargetObjectMetadata: AssignTypeIfIsMorphOrRelationFieldMetadataType<
    Relation<ObjectMetadataEntity>,
    TFieldMetadataType
  >;

  @Column({ nullable: true, type: 'uuid' })
  morphId: AssignIfIsGivenFieldMetadataType<
    string,
    TFieldMetadataType,
    FieldMetadataType.MORPH_RELATION
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
