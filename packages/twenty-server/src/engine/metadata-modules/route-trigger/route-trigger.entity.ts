import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { HTTPMethod } from 'twenty-shared/types';

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

@Entity({ name: 'routeTrigger', schema: 'core' })
@Unique('IDX_ROUTE_TRIGGER_PATH_HTTP_METHOD_WORKSPACE_ID_UNIQUE', [
  'path',
  'httpMethod',
  'workspaceId',
])
export class RouteTriggerEntity
  extends SyncableEntity
  implements Required<RouteTriggerEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  path: string;

  @Column({ nullable: false, default: true })
  isAuthRequired: boolean;

  @Column({
    type: 'enum',
    enum: HTTPMethod,
    default: HTTPMethod.GET,
    nullable: false,
  })
  httpMethod: HTTPMethod;

  @ManyToOne(
    () => ServerlessFunctionEntity,
    (serverlessFunction) => serverlessFunction.routeTriggers,
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
