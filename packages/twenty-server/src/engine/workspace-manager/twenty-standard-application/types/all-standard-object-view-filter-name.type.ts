import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type AllStandardObjectView } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';

export type AllStandardObjectViewFilterName<
  T extends AllStandardObjectName,
  V extends keyof AllStandardObjectView<T>,
> = AllStandardObjectView<T>[V] extends { viewFilters: infer ViewFilters }
  ? keyof ViewFilters
  : never;
