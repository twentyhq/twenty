import {
  FieldMetadataDefaultValue,
  FieldMetadataOptions,
  FieldMetadataSettings,
  FieldMetadataType,
} from 'twenty-shared/types';
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

import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WasRemovedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { RENAME_IS_UI_READ_ONLY_TO_IS_UI_EDITABLE_UPGRADE_COMMAND_NAME } from 'src/engine/metadata-modules/object-metadata/constants/rename-is-ui-read-only-to-is-ui-editable-upgrade-command-name.constant';
import { type FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import { AssignIfIsGivenFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/assign-if-is-given-field-metadata-type.type';
import { AssignTypeIfIsMorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/assign-type-if-is-morph-or-relation-field-metadata-type.type';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';

// This entity is used as a reference test case for type utilities in:
// Modifying relations or properties may require updating type test expectations for Typecheck to pass.
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
@Index('IDX_FIELD_METADATA_WORKSPACE_ID', ['workspaceId'])
export class FieldMetadataEntity<
  TFieldMetadataType extends FieldMetadataType = FieldMetadataType,
>
  extends SyncableEntity
  implements Required<FieldMetadataEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  defaultValue: JsonbProperty<FieldMetadataDefaultValue<TFieldMetadataType>>;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ type: 'jsonb', nullable: true })
  standardOverrides: JsonbProperty<FieldStandardOverridesDTO> | null;

  @Column('jsonb', { nullable: true })
  options: JsonbProperty<FieldMetadataOptions<TFieldMetadataType>>;

  @Column('jsonb', { nullable: true })
  settings: JsonbProperty<FieldMetadataSettings<TFieldMetadataType>>;

  @WasRemovedInUpgrade({
    upgradeCommandName:
      '2.12.0_DropIsCustomFromObjectAndFieldMetadataFastInstanceCommand_1780579070012',
  })
  @Column({ type: 'boolean', default: false })
  isCustom: WasRemovedInUpgrade<boolean>;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      RENAME_IS_UI_READ_ONLY_TO_IS_UI_EDITABLE_UPGRADE_COMMAND_NAME,
  })
  @Column({ default: true })
  isUIEditable: boolean;

  @WasRemovedInUpgrade({
    upgradeCommandName:
      RENAME_IS_UI_READ_ONLY_TO_IS_UI_EDITABLE_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'boolean', default: false })
  isUIReadOnly: WasRemovedInUpgrade<boolean>;

  // Is this really nullable ?
  @Column({ nullable: true, default: true, type: 'boolean' })
  isNullable: boolean | null;

  // Derived at flat-entity cache build time from the existence of a
  // single-field UNIQUE IndexMetadata covering this field — never persisted
  // on this entity. Kept on the type so flat-entity consumers continue to
  // read field.isUnique without per-call derivation; the PG column was
  // dropped by 1798300000000-drop-field-metadata-is-unique-column.ts.
  isUnique: boolean | null;

  @Column({ default: false })
  isLabelSyncedWithName: boolean;

  @Column({ nullable: true, type: 'uuid' })
  relationTargetFieldMetadataId: AssignTypeIfIsMorphOrRelationFieldMetadataType<
    string,
    TFieldMetadataType
  >;

  @OneToOne(
    () => FieldMetadataEntity,
    (fieldMetadata) => fieldMetadata.relationTargetFieldMetadataId,
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

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
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
    (indexFieldMetadata) => indexFieldMetadata.indexMetadata,
    {
      cascade: true,
    },
  )
  indexFieldMetadatas: Relation<IndexFieldMetadataEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(
    () => FieldPermissionEntity,
    (fieldPermission) => fieldPermission.fieldMetadata,
  )
  fieldPermissions: Relation<FieldPermissionEntity[]>;

  @OneToMany(() => ViewFieldEntity, (viewField) => viewField.fieldMetadata)
  viewFields: Relation<ViewFieldEntity[]>;

  @OneToMany(() => ViewFilterEntity, (viewFilter) => viewFilter.fieldMetadata)
  viewFilters: Relation<ViewFilterEntity[]>;

  @OneToMany(
    () => ViewEntity,
    (view) => view.kanbanAggregateOperationFieldMetadata,
  )
  kanbanAggregateOperationViews: Relation<ViewEntity[]>;

  @OneToMany(() => ViewEntity, (view) => view.calendarFieldMetadata)
  calendarViews: Relation<ViewEntity[]>;

  @OneToMany(() => ViewEntity, (view) => view.mainGroupByFieldMetadata)
  mainGroupByFieldMetadataViews: Relation<ViewEntity[]>;

  @OneToMany(() => ViewSortEntity, (viewSort) => viewSort.fieldMetadata)
  viewSorts: Relation<ViewSortEntity[]>;
}
