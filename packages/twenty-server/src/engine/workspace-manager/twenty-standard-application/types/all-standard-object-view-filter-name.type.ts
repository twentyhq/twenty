import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { AllStandardObjectViewName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';
import { AllStandardObjectView } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view.type';

export type AllStandardObjectViewFilterName<
  T extends AllStandardObjectName,
  V extends AllStandardObjectViewName<T>,
> = AllStandardObjectView<T>[V] extends { viewFilters: infer ViewFilters }
  ? keyof ViewFilters
  : never;
