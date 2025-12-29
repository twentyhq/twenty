import { AllNonWorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/all-non-workspace-related-entity.type';
import { WorkspaceBoundEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-bound-entity';
import { type Relation } from 'typeorm';

export type ExtractEntityOneToManyEntityRelationProperties<
  T,
  TTarget = WorkspaceBoundEntity | AllNonWorkspaceRelatedEntity,
> = NonNullable<
  {
    [P in keyof T]: NonNullable<T[P]> extends Array<infer U>
      ? U extends Relation<TTarget>
        ? P
        : never
      : never;
  }[keyof T]
>;
