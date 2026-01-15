import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntityRequired } from 'src/engine/workspace-manager/types/syncable-entity-required.interface';

export enum CommandMenuItemAvailabilityType {
  GLOBAL = 'GLOBAL',
  SINGLE_RECORD = 'SINGLE_RECORD',
  BULK_RECORDS = 'BULK_RECORDS',
}

@Entity('commandMenuItem')
@Index('IDX_COMMAND_MENU_ITEM_WORKFLOW_ID_WORKSPACE_ID', [
  'workflowId',
  'workspaceId',
])
export class CommandMenuItemEntity
  extends SyncableEntityRequired
  implements Required<CommandMenuItemEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workflowId: string;

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

  @Column({ nullable: true, type: 'varchar' })
  availabilityObjectNameSingular: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
