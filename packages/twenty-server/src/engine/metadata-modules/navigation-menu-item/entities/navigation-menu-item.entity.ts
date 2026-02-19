import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'navigationMenuItem', schema: 'core' })
@Index('IDX_NAVIGATION_MENU_ITEM_USER_WORKSPACE_ID_WORKSPACE_ID', [
  'userWorkspaceId',
  'workspaceId',
])
@Index('IDX_NAVIGATION_MENU_ITEM_TARGET_RECORD_OBJ_METADATA_WS_ID', [
  'targetRecordId',
  'targetObjectMetadataId',
  'workspaceId',
])
@Index('IDX_NAVIGATION_MENU_ITEM_FOLDER_ID_WORKSPACE_ID', [
  'folderId',
  'workspaceId',
])
@Index('IDX_NAVIGATION_MENU_ITEM_VIEW_ID_WORKSPACE_ID', [
  'viewId',
  'workspaceId',
])
@Check(
  'CHK_navigation_menu_item_target_fields',
  '("targetRecordId" IS NULL AND "targetObjectMetadataId" IS NULL) OR ("targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL)',
)
export class NavigationMenuItemEntity
  extends SyncableEntity
  implements Required<NavigationMenuItemEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserWorkspaceEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: Relation<UserWorkspaceEntity> | null;

  @Column({ nullable: true, type: 'uuid' })
  userWorkspaceId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  targetRecordId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  targetObjectMetadataId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  viewId: string | null;

  @ManyToOne(() => ViewEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity> | null;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'targetObjectMetadataId' })
  targetObjectMetadata: Relation<ObjectMetadataEntity> | null;

  @Column({ nullable: true, type: 'text' })
  name: string | null;

  @Column({ nullable: true, type: 'text' })
  link: string | null;

  @Column({ nullable: true, type: 'text' })
  icon: string | null;

  @ManyToOne(() => NavigationMenuItemEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'folderId' })
  folder: Relation<NavigationMenuItemEntity> | null;

  @Column({ nullable: true, type: 'uuid' })
  folderId: string | null;

  @Column({ nullable: false, type: 'double precision' })
  position: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
