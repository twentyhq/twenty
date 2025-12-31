import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

export type CronTriggerSettings = {
  pattern: string;
};

@Entity({ name: 'cronTrigger', schema: 'core' })
@Index('IDX_CRON_TRIGGER_WORKSPACE_ID', ['workspaceId'])
export class CronTriggerEntity
  extends SyncableEntity
  implements Required<CronTriggerEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'jsonb' })
  settings: CronTriggerSettings;

  @ManyToOne(
    () => ServerlessFunctionEntity,
    (serverlessFunction) => serverlessFunction.cronTriggers,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'serverlessFunctionId' })
  serverlessFunction: Relation<ServerlessFunctionEntity>;

  @Column({ nullable: false, type: 'uuid' })
  serverlessFunctionId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
