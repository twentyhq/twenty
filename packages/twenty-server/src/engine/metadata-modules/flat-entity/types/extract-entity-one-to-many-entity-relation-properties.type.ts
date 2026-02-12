import { type AllNonWorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/all-non-workspace-related-entity.type';
import { type WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

export type ExtractEntityOneToManyEntityRelationProperties<
  T,
  TTarget = WorkspaceRelatedEntity | AllNonWorkspaceRelatedEntity,
> = NonNullable<
  {
    [P in keyof T]: NonNullable<T[P]> extends Array<infer U>
      ? U extends TTarget
        ? P
        : never
      : never;
  }[keyof T]
>;
