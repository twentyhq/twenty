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
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

export enum CommandMenuItemAvailabilityType {
  GLOBAL = 'GLOBAL',
  SINGLE_RECORD = 'SINGLE_RECORD',
  BULK_RECORDS = 'BULK_RECORDS',
}

@Entity({ name: 'commandMenuItem', schema: 'core' })
@Index('IDX_COMMAND_MENU_ITEM_WORKFLOW_VERSION_ID_WORKSPACE_ID', [
  'workflowVersionId',
  'workspaceId',
])
@Index('IDX_COMMAND_MENU_ITEM_AVAILABILITY_OBJECT_METADATA_ID', [
  'availabilityObjectMetadataId',
])
export class CommandMenuItemEntity
  extends SyncableEntity
  implements Required<CommandMenuItemEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workflowVersionId: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ default: false })
  isPinned: boolean;

  @Column({
    type: 'enum',
    enum: CommandMenuItemAvailabilityType,
    nullable: false,
    default: CommandMenuItemAvailabilityType.GLOBAL,
  })
  availabilityType: CommandMenuItemAvailabilityType;

  @Column({ nullable: true, type: 'uuid' })
  availabilityObjectMetadataId: string | null;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'availabilityObjectMetadataId' })
  availabilityObjectMetadata: Relation<ObjectMetadataEntity> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
