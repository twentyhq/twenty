import { EVENT_LOG_RETENTION } from '@/constants/EventLogRetention';

export const getEventLogRetentionInHours = ({
  workspaceRetentionInDays,
  hasAuditLogsEntitlement,
}: {
  workspaceRetentionInDays: number;
  hasAuditLogsEntitlement: boolean;
}): number => {
  if (!hasAuditLogsEntitlement) {
    return EVENT_LOG_RETENTION.proPlanInHours;
  }

  return Math.min(workspaceRetentionInDays, EVENT_LOG_RETENTION.maxInDays) * 24;
};
