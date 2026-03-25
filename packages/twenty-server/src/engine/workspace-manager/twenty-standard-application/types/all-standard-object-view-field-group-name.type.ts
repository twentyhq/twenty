import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type AllStandardObjectViewName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';
import { type AllStandardObjectView } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view.type';

export type AllStandardObjectViewFieldGroupName<
  T extends AllStandardObjectName,
  V extends AllStandardObjectViewName<T>,
> = AllStandardObjectView<T>[V] extends {
  viewFieldGroups: infer ViewFieldGroups;
}
  ? keyof ViewFieldGroups
  : never;
