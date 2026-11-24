import { computeChannelInboxViewPresetGqlFilter } from '@/ai/utils/compute-channel-inbox-view-preset-gql-filter.util';
import { computePersonalInboxViewPresetGqlFilter } from '@/ai/utils/compute-personal-inbox-view-preset-gql-filter.util';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';
import { type ViewPresetFilter } from '@/types/ViewPresetFilter';
import { isDefined } from '@/utils/validation/isDefined';

const MATCHES_NO_RECORD: RecordGqlOperationFilter = { id: { is: 'NULL' } };

export const computeViewPresetFilterGqlFilter = ({
  presetFilter,
  currentWorkspaceMemberId,
}: {
  presetFilter: `${ViewPresetFilter}` | null | undefined;
  currentWorkspaceMemberId: string | undefined;
}): RecordGqlOperationFilter => {
  if (!isDefined(presetFilter)) {
    return {};
  }

  switch (presetFilter) {
    case 'INBOX_OPEN':
    case 'INBOX_SNOOZED':
    case 'INBOX_DONE':
    case 'INBOX_MENTIONS':
      if (!isDefined(currentWorkspaceMemberId)) {
        return MATCHES_NO_RECORD;
      }

      return computePersonalInboxViewPresetGqlFilter({
        presetFilter,
        workspaceMemberId: currentWorkspaceMemberId,
      });
    case 'INBOX_CHANNEL_OPEN':
    case 'INBOX_CHANNEL_SNOOZED':
    case 'INBOX_CHANNEL_DONE':
      return computeChannelInboxViewPresetGqlFilter(presetFilter);
  }
};
