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

import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

export enum CommandMenuItemAvailabilityType {
  GLOBAL = 'GLOBAL',
  RECORD_SELECTION = 'RECORD_SELECTION',
  FALLBACK = 'FALLBACK',
}

export enum EngineComponentKey {
  CREATE_NEW_RECORD = 'CREATE_NEW_RECORD',
  DELETE_SINGLE_RECORD = 'DELETE_SINGLE_RECORD',
  DELETE_MULTIPLE_RECORDS = 'DELETE_MULTIPLE_RECORDS',
  RESTORE_SINGLE_RECORD = 'RESTORE_SINGLE_RECORD',
  RESTORE_MULTIPLE_RECORDS = 'RESTORE_MULTIPLE_RECORDS',
  DESTROY_SINGLE_RECORD = 'DESTROY_SINGLE_RECORD',
  DESTROY_MULTIPLE_RECORDS = 'DESTROY_MULTIPLE_RECORDS',
  ADD_TO_FAVORITES = 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES = 'REMOVE_FROM_FAVORITES',
  MERGE_MULTIPLE_RECORDS = 'MERGE_MULTIPLE_RECORDS',
  DUPLICATE_DASHBOARD = 'DUPLICATE_DASHBOARD',
  DUPLICATE_WORKFLOW = 'DUPLICATE_WORKFLOW',
  ACTIVATE_WORKFLOW = 'ACTIVATE_WORKFLOW',
  DEACTIVATE_WORKFLOW = 'DEACTIVATE_WORKFLOW',
  DISCARD_DRAFT_WORKFLOW = 'DISCARD_DRAFT_WORKFLOW',
  TEST_WORKFLOW = 'TEST_WORKFLOW',
  STOP_WORKFLOW_RUN = 'STOP_WORKFLOW_RUN',
  USE_AS_DRAFT_WORKFLOW_VERSION = 'USE_AS_DRAFT_WORKFLOW_VERSION',
  SAVE_RECORD_PAGE_LAYOUT = 'SAVE_RECORD_PAGE_LAYOUT',
  SAVE_DASHBOARD_LAYOUT = 'SAVE_DASHBOARD_LAYOUT',
  TIDY_UP_WORKFLOW = 'TIDY_UP_WORKFLOW',
}

@Entity({ name: 'commandMenuItem', schema: 'core' })
@Index('IDX_COMMAND_MENU_ITEM_WORKFLOW_VERSION_ID_WORKSPACE_ID', [
  'workflowVersionId',
  'workspaceId',
])
@Index('IDX_COMMAND_MENU_ITEM_FRONT_COMPONENT_ID_WORKSPACE_ID', [
  'frontComponentId',
  'workspaceId',
])
@Index('IDX_COMMAND_MENU_ITEM_AVAILABILITY_OBJECT_METADATA_ID', [
  'availabilityObjectMetadataId',
])
@Check(
  'CHK_command_menu_item_workflow_or_front_component_or_standard_key',
  '("workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "engineComponentKey" IS NULL) OR ("workflowVersionId" IS NULL AND "frontComponentId" IS NOT NULL AND "engineComponentKey" IS NULL) OR ("workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "engineComponentKey" IS NOT NULL)',
)
export class CommandMenuItemEntity
  extends SyncableEntity
  implements Required<CommandMenuItemEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  workflowVersionId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  frontComponentId: string | null;

  @ManyToOne(() => FrontComponentEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'frontComponentId' })
  frontComponent: Relation<FrontComponentEntity> | null;

  @Column({
    type: 'enum',
    enum: EngineComponentKey,
    nullable: true,
  })
  engineComponentKey: EngineComponentKey | null;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ nullable: true, type: 'varchar' })
  shortLabel: string | null;

  @Column({ nullable: false, type: 'double precision', default: 0 })
  position: number;

  @Column({ default: false })
  isPinned: boolean;

  @Column({
    type: 'enum',
    enum: CommandMenuItemAvailabilityType,
    nullable: false,
    default: CommandMenuItemAvailabilityType.GLOBAL,
  })
  availabilityType: CommandMenuItemAvailabilityType;

  @Column({ nullable: true, type: 'varchar' })
  conditionalAvailabilityExpression: string | null;

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
