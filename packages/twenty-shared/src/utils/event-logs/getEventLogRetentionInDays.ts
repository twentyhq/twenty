import { EVENT_LOG_RETENTION_IN_DAYS } from '@/constants/EventLogRetentionInDays';
import { EventLogTable } from '@/types/EventLogTable';

export const getEventLogRetentionInDays = ({
  table,
  workspaceRetentionInDays,
  hasAuditLogsEntitlement,
}: {
  table: `${EventLogTable}`;
  workspaceRetentionInDays: number;
  hasAuditLogsEntitlement: boolean;
}): number => {
  if (table === EventLogTable.APPLICATION_LOG) {
    return EVENT_LOG_RETENTION_IN_DAYS.applicationLog;
  }

  return hasAuditLogsEntitlement
    ? workspaceRetentionInDays
    : EVENT_LOG_RETENTION_IN_DAYS.default;
};
