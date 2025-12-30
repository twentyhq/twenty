import { type Relation } from 'typeorm';

import { type AllNonWorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/all-non-workspace-related-entity.type';
import { type WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

export type ExtractEntityManyToOneEntityRelationProperties<
  T,
  TTarget = WorkspaceRelatedEntity | AllNonWorkspaceRelatedEntity,
> = NonNullable<
  {
    [P in keyof T]: [NonNullable<T[P]>] extends [never]
      ? never
      : NonNullable<T[P]> extends Relation<TTarget>
        ? P
        : never;
  }[keyof T]
>;
