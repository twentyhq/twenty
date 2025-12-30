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

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { type DatabaseEventTriggerEntityRelationProperties } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

export type DatabaseEventTriggerSettings = {
  eventName: string;
};

export const DATABASE_EVENT_TRIGGER_ENTITY_RELATION_PROPERTIES = [
  'serverlessFunction',
] as const satisfies readonly DatabaseEventTriggerEntityRelationProperties[];

@Entity('databaseEventTrigger')
@Index('IDX_DATABASE_EVENT_TRIGGER_WORKSPACE_ID', ['workspaceId'])
export class DatabaseEventTriggerEntity
  extends SyncableEntity
  implements Required<DatabaseEventTriggerEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'jsonb' })
  settings: DatabaseEventTriggerSettings;

  @ManyToOne(
    () => ServerlessFunctionEntity,
    (serverlessFunction) => serverlessFunction.databaseEventTriggers,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'serverlessFunctionId' })
  serverlessFunction: Relation<ServerlessFunctionEntity>;

  @Column({ nullable: false, type: 'uuid' })
  serverlessFunctionId: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
