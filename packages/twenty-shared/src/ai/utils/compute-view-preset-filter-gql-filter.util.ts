import { computeChannelInboxStatusGqlFilter } from '@/ai/utils/compute-channel-inbox-status-gql-filter.util';
import { computeMemberInboxStatusGqlFilter } from '@/ai/utils/compute-member-inbox-status-gql-filter.util';
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

      return computeMemberInboxStatusGqlFilter({
        presetFilter,
        workspaceMemberId: currentWorkspaceMemberId,
      });
    case 'INBOX_CHANNEL_OPEN':
    case 'INBOX_CHANNEL_SNOOZED':
    case 'INBOX_CHANNEL_DONE':
      return computeChannelInboxStatusGqlFilter(presetFilter);
  }
};
