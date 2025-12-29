import { type Relation } from 'typeorm';

import { AllNonWorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/all-non-workspace-related-entity.type';
import { WorkspaceBoundEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-bound-entity';

export type ExtractEntityManyToOneEntityRelationProperties<
  T,
  TTarget = WorkspaceBoundEntity | AllNonWorkspaceRelatedEntity,
> = NonNullable<
  {
    [P in keyof T]: [NonNullable<T[P]>] extends [never]
      ? never
      : NonNullable<T[P]> extends Relation<TTarget>
        ? P
        : never;
  }[keyof T]
>;
