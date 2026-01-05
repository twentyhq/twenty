import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type AllNonWorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/all-non-workspace-related-entity.type';
import { type WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

export type ExtractEntityRelatedEntityProperties<
  T,
  TTarget = WorkspaceRelatedEntity | AllNonWorkspaceRelatedEntity,
> =
  | ExtractEntityManyToOneEntityRelationProperties<T, TTarget>
  | ExtractEntityOneToManyEntityRelationProperties<T, TTarget>;
