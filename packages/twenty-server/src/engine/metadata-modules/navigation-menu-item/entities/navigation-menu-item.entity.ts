import {
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

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SyncableEntityRequired } from 'src/engine/workspace-manager/types/syncable-entity-required.interface';

@Entity({ name: 'navigationMenuItem', schema: 'core' })
@Index('IDX_NAVIGATION_MENU_ITEM_FOR_WORKSPACE_MEMBER_ID_WORKSPACE_ID', [
  'forWorkspaceMemberId',
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
export class NavigationMenuItemEntity
  extends SyncableEntityRequired
  implements Required<NavigationMenuItemEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  forWorkspaceMemberId: string | null;

  @Column({ nullable: false, type: 'uuid' })
  targetRecordId: string;

  @Column({ nullable: false, type: 'uuid' })
  targetObjectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'targetObjectMetadataId' })
  targetObjectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: true, type: 'uuid' })
  folderId: string | null;

  @Column({ nullable: false })
  position: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
