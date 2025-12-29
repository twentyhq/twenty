import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { AllNonWorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/all-non-workspace-related-entity.type';
import { WorkspaceBoundEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-bound-entity';

export type ExtractEntityRelatedEntityProperties<
  T,
  TTarget = WorkspaceBoundEntity | AllNonWorkspaceRelatedEntity,
> =
  | ExtractEntityManyToOneEntityRelationProperties<T, TTarget>
  | ExtractEntityOneToManyEntityRelationProperties<T, TTarget>;
