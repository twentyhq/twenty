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

import { type CommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item-payload.union';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

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
  'CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE',
  `("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "payload" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "payload" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND "payload" IS NOT NULL AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL)`,
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

  @Column({ type: 'varchar', nullable: false })
  engineComponentKey: EngineComponentKey;

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
    enum: Object.values(CommandMenuItemAvailabilityType),
    nullable: false,
    default: CommandMenuItemAvailabilityType.GLOBAL,
  })
  availabilityType: CommandMenuItemAvailabilityType;

  @Column({ type: 'jsonb', nullable: true })
  payload: CommandMenuItemPayload | null;

  @Column({ type: 'text', array: true, nullable: true })
  hotKeys: string[] | null;

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
