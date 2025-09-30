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

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { CronTriggerEntityRelationProperties } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

export type CronTriggerSettings = {
  pattern: string;
};

export const CRON_TRIGGER_ENTITY_RELATION_PROPERTIES = [
  'serverlessFunction',
] as const satisfies readonly CronTriggerEntityRelationProperties[];

@Entity({ name: 'cronTrigger', schema: 'core' })
@Index('IDX_CRON_TRIGGER_WORKSPACE_ID', ['workspaceId'])
export class CronTrigger extends SyncableEntity {
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

  @Column({ nullable: true, type: 'uuid' })
  serverlessFunctionId: string | null;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
