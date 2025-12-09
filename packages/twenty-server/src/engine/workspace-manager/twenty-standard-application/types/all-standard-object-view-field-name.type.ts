import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { AllStandardObjectView } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';

export type AllStandardObjectViewFieldName<
  T extends AllStandardObjectName,
  V extends keyof AllStandardObjectView<T>,
> = AllStandardObjectView<T>[V] extends { viewFields: infer ViewFields }
  ? keyof ViewFields
  : never;

type titi = AllStandardObjectViewFieldName<'company', 'allCompanies'>;
