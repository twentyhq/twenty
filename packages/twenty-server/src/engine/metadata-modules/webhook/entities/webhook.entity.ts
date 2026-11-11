import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_CONDITION_TO_WEBHOOK_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-58/add-condition-to-webhook-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Index('IDX_WEBHOOK_WORKSPACE_ID', ['workspaceId'])
@Entity({ name: 'webhook', schema: 'core' })
export class WebhookEntity
  extends SyncableEntity
  implements Required<WebhookEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  targetUrl: string;

  @Column('text', { array: true, default: ['*.*'] })
  operations: string[];

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_CONDITION_TO_WEBHOOK_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'text', nullable: true })
  condition: string | null;

  @Column({ nullable: false })
  secret: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
