import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { type WorkspaceEntityDuplicateCriteria } from 'src/engine/api/graphql/workspace-query-builder/types/workspace-entity-duplicate-criteria.type';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ObjectStandardOverridesDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-standard-overrides.dto';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

@Entity('objectMetadata')
@Unique('IDX_OBJECT_METADATA_NAME_SINGULAR_WORKSPACE_ID_UNIQUE', [
  'nameSingular',
  'workspaceId',
])
@Unique('IDX_OBJECT_METADATA_NAME_PLURAL_WORKSPACE_ID_UNIQUE', [
  'namePlural',
  'workspaceId',
])
export class ObjectMetadataEntity
  extends SyncableEntity
  implements Required<ObjectMetadataEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  standardId: string | null;

  @Column({ nullable: false, type: 'uuid' })
  dataSourceId: string;

  @Column({ nullable: false })
  nameSingular: string;

  @Column({ nullable: false })
  namePlural: string;

  @Column({ nullable: false })
  labelSingular: string;

  @Column({ nullable: false })
  labelPlural: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ type: 'jsonb', nullable: true })
  standardOverrides: ObjectStandardOverridesDTO | null;

  /**
   * @deprecated
   */
  @Column({ nullable: false })
  targetTableName: string;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ default: false })
  isRemote: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ default: false })
  isUIReadOnly: boolean;

  @Column({ default: true })
  isAuditLogged: boolean;

  @Column({ default: false })
  isSearchable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  duplicateCriteria: WorkspaceEntityDuplicateCriteria[] | null;

  @Column({ nullable: true, type: 'varchar' })
  shortcut: string | null;

  // TODO: This should not be nullable - legacy field introduced when label identifier was nullable
  @Column({ nullable: true, type: 'uuid' })
  labelIdentifierFieldMetadataId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  imageIdentifierFieldMetadataId: string | null;

  @Column({ default: false })
  isLabelSyncedWithName: boolean;

  @OneToMany(() => FieldMetadataEntity, (field) => field.object, {
    cascade: true,
  })
  fields: Relation<FieldMetadataEntity[]>;

  @OneToMany(() => IndexMetadataEntity, (index) => index.objectMetadata, {
    cascade: true,
  })
  indexMetadatas: Relation<IndexMetadataEntity[]>;

  @OneToMany(
    () => FieldMetadataEntity,
    (field) => field.relationTargetObjectMetadataId,
  )
  targetRelationFields: Relation<FieldMetadataEntity[]>;

  @ManyToOne(() => DataSourceEntity, (dataSource) => dataSource.objects, {
    onDelete: 'CASCADE',
  })
  dataSource: Relation<DataSourceEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(
    () => ObjectPermissionEntity,
    (objectPermission) => objectPermission.objectMetadata,
    {
      cascade: true,
    },
  )
  objectPermissions: Relation<ObjectPermissionEntity[]>;

  @OneToMany(
    () => FieldPermissionEntity,
    (fieldPermission) => fieldPermission.objectMetadata,
    {
      cascade: true,
    },
  )
  fieldPermissions: Relation<FieldPermissionEntity[]>;

  @OneToMany(() => ViewEntity, (view) => view.objectMetadata, {
    cascade: true,
  })
  views: Relation<ViewEntity[]>;
}
