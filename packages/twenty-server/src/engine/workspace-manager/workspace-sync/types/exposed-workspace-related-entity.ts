import { Field } from '@nestjs/graphql';

import { Column } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

export abstract class ExposedWorkspaceRelatedEntity extends WorkspaceRelatedEntity {
  @Field(() => UUIDScalarType)
  @Column({ nullable: false, type: 'uuid' })
  override workspaceId: string;
}
