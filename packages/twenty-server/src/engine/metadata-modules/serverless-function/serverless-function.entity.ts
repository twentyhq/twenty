import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

const DEFAULT_SERVERLESS_TIMEOUT_SECONDS = 300; // 5 minutes

export enum ServerlessFunctionRuntime {
  NODE18 = 'nodejs18.x',
  NODE22 = 'nodejs22.x',
}

export const DEFAULT_HANDLER_PATH = 'src/index.ts';
export const DEFAULT_HANDLER_NAME = 'main';

@Entity('serverlessFunction')
@Index('IDX_SERVERLESS_FUNCTION_ID_DELETED_AT', ['id', 'deletedAt'])
export class ServerlessFunctionEntity
  extends SyncableEntity
  implements Required<ServerlessFunctionEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, default: DEFAULT_HANDLER_PATH })
  handlerPath: string;

  @Column({ nullable: false, default: DEFAULT_HANDLER_NAME })
  handlerName: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  latestVersion: string | null;

  @Column({ nullable: false, type: 'jsonb', default: [] })
  publishedVersions: string[];

  @Column({ nullable: false, default: ServerlessFunctionRuntime.NODE22 })
  runtime: ServerlessFunctionRuntime;

  @Column({ nullable: false, default: DEFAULT_SERVERLESS_TIMEOUT_SECONDS })
  @Check(`"timeoutSeconds" >= 1 AND "timeoutSeconds" <= 900`)
  timeoutSeconds: number;

  @Column({ nullable: true, type: 'text' })
  checksum: string | null;

  @Column({ nullable: true, type: 'jsonb' })
  toolInputSchema: object | null;

  @Column({ nullable: false, default: false })
  isTool: boolean;

  @Column({ nullable: false, type: 'uuid' })
  serverlessFunctionLayerId: string;

  @ManyToOne(
    () => ServerlessFunctionLayerEntity,
    (serverlessFunctionLayer) => serverlessFunctionLayer.serverlessFunctions,
    { nullable: false },
  )
  @JoinColumn({ name: 'serverlessFunctionLayerId' })
  serverlessFunctionLayer: Relation<ServerlessFunctionLayerEntity>;

  @OneToMany(
    () => CronTriggerEntity,
    (cronTrigger) => cronTrigger.serverlessFunction,
    {
      cascade: true,
    },
  )
  cronTriggers: CronTriggerEntity[];

  @OneToMany(
    () => DatabaseEventTriggerEntity,
    (databaseEventTrigger) => databaseEventTrigger.serverlessFunction,
    {
      cascade: true,
    },
  )
  databaseEventTriggers: DatabaseEventTriggerEntity[];

  @OneToMany(
    () => RouteTriggerEntity,
    (routeTrigger) => routeTrigger.serverlessFunction,
    {
      cascade: true,
    },
  )
  routeTriggers: RouteTriggerEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
