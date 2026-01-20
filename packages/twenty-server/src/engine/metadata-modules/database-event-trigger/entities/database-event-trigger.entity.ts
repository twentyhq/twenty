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
import { SyncableEntityRequired } from 'src/engine/workspace-manager/types/syncable-entity-required.interface';

export type DatabaseEventTriggerSettings = {
  eventName: string;
  updatedFields?: string[];
};

@Entity('databaseEventTrigger')
@Index('IDX_DATABASE_EVENT_TRIGGER_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_DATABASE_EVENT_TRIGGER_SERVERLESS_FUNCTION_ID', [
  'serverlessFunctionId',
])
export class DatabaseEventTriggerEntity
  extends SyncableEntityRequired
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
