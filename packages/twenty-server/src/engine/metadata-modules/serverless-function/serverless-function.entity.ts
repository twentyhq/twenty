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

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { CronTrigger } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { DatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { RouteTrigger } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { ServerlessFunctionEntityRelationProperties } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { InputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/input-schema.type';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';

const DEFAULT_SERVERLESS_TIMEOUT_SECONDS = 300; // 5 minutes

export enum ServerlessFunctionRuntime {
  NODE18 = 'nodejs18.x',
  NODE22 = 'nodejs22.x',
}

export const SERVERLESS_FUNCTION_ENTITY_RELATION_PROPERTIES = [
  'cronTriggers',
  'databaseEventTriggers',
  'routeTriggers',
] as const satisfies readonly ServerlessFunctionEntityRelationProperties[];

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

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  latestVersion: string | null;

  @Column({ nullable: false, type: 'jsonb', default: [] })
  publishedVersions: string[];

  @Column({ nullable: true, type: 'jsonb' })
  latestVersionInputSchema: InputSchema | null;

  @Column({ nullable: false, default: ServerlessFunctionRuntime.NODE22 })
  runtime: ServerlessFunctionRuntime;

  @Column({ nullable: false, default: DEFAULT_SERVERLESS_TIMEOUT_SECONDS })
  @Check(`"timeoutSeconds" >= 1 AND "timeoutSeconds" <= 900`)
  timeoutSeconds: number;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ nullable: true, type: 'uuid' })
  applicationId: string | null;

  @Column({ nullable: true, type: 'text' })
  checksum: string | null;

  @Column({ nullable: false, type: 'uuid' })
  serverlessFunctionLayerId: string;

  @ManyToOne(
    () => ServerlessFunctionLayerEntity,
    (serverlessFunctionLayer) => serverlessFunctionLayer.serverlessFunctions,
    { nullable: false },
  )
  @JoinColumn({ name: 'serverlessFunctionLayerId' })
  serverlessFunctionLayer: Relation<ServerlessFunctionLayerEntity>;

  @ManyToOne(
    () => ApplicationEntity,
    (application) => application.serverlessFunctions,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity> | null;

  @OneToMany(
    () => CronTrigger,
    (cronTrigger) => cronTrigger.serverlessFunction,
    {
      cascade: true,
    },
  )
  cronTriggers: CronTrigger[];

  @OneToMany(
    () => DatabaseEventTrigger,
    (databaseEventTrigger) => databaseEventTrigger.serverlessFunction,
    {
      cascade: true,
    },
  )
  databaseEventTriggers: DatabaseEventTrigger[];

  @OneToMany(
    () => RouteTrigger,
    (routeTrigger) => routeTrigger.serverlessFunction,
    {
      cascade: true,
    },
  )
  routeTriggers: RouteTrigger[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
