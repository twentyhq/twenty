import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ nullable: false })
  secret: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
