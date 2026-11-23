import { computeViewPresetFilterGqlFilter } from 'twenty-shared/ai';
import {
  type RecordGqlOperationFilter,
  type ViewPresetFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const computeViewPresetGqlOperationFilter = ({
  view,
  currentWorkspaceMemberId,
}: {
  view: { presetFilter?: ViewPresetFilter | null } | null;
  currentWorkspaceMemberId: string | undefined;
}): RecordGqlOperationFilter =>
  isDefined(view?.presetFilter)
    ? computeViewPresetFilterGqlFilter({
        presetFilter: view.presetFilter,
        currentWorkspaceMemberId,
      })
    : {};
