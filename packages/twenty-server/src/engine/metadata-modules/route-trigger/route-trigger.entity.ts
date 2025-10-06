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

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { RouteTriggerEntityRelationProperties } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export const ROUTE_TRIGGER_ENTITY_RELATION_PROPERTIES = [
  'serverlessFunction',
] as const satisfies readonly RouteTriggerEntityRelationProperties[];

@Entity({ name: 'routeTrigger', schema: 'core' })
@Unique('IDX_ROUTE_TRIGGER_PATH_HTTP_METHOD_WORKSPACE_ID_UNIQUE', [
  'path',
  'httpMethod',
  'workspaceId',
])
export class RouteTrigger
  extends SyncableEntity
  implements Required<RouteTrigger>
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
