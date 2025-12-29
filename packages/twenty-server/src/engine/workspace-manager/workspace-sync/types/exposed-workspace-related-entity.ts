import { Field } from '@nestjs/graphql';

import { Column, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

export abstract class ExposedWorkspaceRelatedEntity extends WorkspaceRelatedEntity {
  @Field(() => UUIDScalarType)
  @Column({ nullable: false, type: 'uuid' })
  override workspaceId: string;

  @Field(() => WorkspaceEntity)
  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  override workspace: Relation<WorkspaceEntity>;
}
