import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_VIEW_SORT_RELATION_TARGET_FIELD_METADATA_ID_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-61/add-view-sort-relation-target-field-metadata-id-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ViewSortDirection } from 'twenty-shared/types';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'viewSort', schema: 'core' })
@Index('IDX_VIEW_SORT_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index('IDX_VIEW_SORT_VIEW_ID', ['viewId'])
@Index('IDX_VIEW_SORT_FIELD_METADATA_ID', ['fieldMetadataId'])
@Index(
  'IDX_VIEW_SORT_RELATION_TARGET_FIELD_METADATA_ID',
  ['relationTargetFieldMetadataId'],
  { where: '"relationTargetFieldMetadataId" IS NOT NULL' },
)
@Index(
  'IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE',
  ['fieldMetadataId', 'viewId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
export class ViewSortEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

  @ManyToOne(() => FieldMetadataEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fieldMetadataId' })
  fieldMetadata: Relation<FieldMetadataEntity>;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(ViewSortDirection),
    default: ViewSortDirection.ASC,
  })
  direction: ViewSortDirection;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.3.0_AddSubFieldNameToViewSortEarlyFastInstanceCommand_1747234200000',
  })
  @Column({ nullable: true, type: 'varchar' })
  subFieldName?: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_VIEW_SORT_RELATION_TARGET_FIELD_METADATA_ID_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid', default: null })
  relationTargetFieldMetadataId: string | null;

  // Not CASCADE: syncs delete fields before updating sorts; the on-delete side effect cleans up instead
  @ManyToOne(() => FieldMetadataEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'relationTargetFieldMetadataId' })
  relationTargetFieldMetadata: Relation<FieldMetadataEntity> | null;

  @Column({ nullable: false, type: 'uuid' })
  viewId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;

  @ManyToOne(() => ViewEntity, (view) => view.viewSorts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;
}
