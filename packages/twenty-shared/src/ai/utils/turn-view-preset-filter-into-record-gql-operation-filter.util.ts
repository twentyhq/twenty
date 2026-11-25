import { turnChannelInboxViewPresetFilterIntoRecordGqlOperationFilter } from '@/ai/utils/turn-channel-inbox-view-preset-filter-into-record-gql-operation-filter.util';
import { turnPersonalInboxViewPresetFilterIntoRecordGqlOperationFilter } from '@/ai/utils/turn-personal-inbox-view-preset-filter-into-record-gql-operation-filter.util';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';
import { type ViewPresetFilter } from '@/types/ViewPresetFilter';
import { isDefined } from '@/utils/validation/isDefined';

const MATCHES_NO_RECORD: RecordGqlOperationFilter = { id: { is: 'NULL' } };

export const turnViewPresetFilterIntoRecordGqlOperationFilter = ({
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

      return turnPersonalInboxViewPresetFilterIntoRecordGqlOperationFilter({
        presetFilter,
        workspaceMemberId: currentWorkspaceMemberId,
      });
    case 'INBOX_CHANNEL_OPEN':
    case 'INBOX_CHANNEL_SNOOZED':
    case 'INBOX_CHANNEL_DONE':
      return turnChannelInboxViewPresetFilterIntoRecordGqlOperationFilter(
        presetFilter,
      );
  }
};
