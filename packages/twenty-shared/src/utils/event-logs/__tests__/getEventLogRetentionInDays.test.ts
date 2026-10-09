import { EVENT_LOG_RETENTION_IN_DAYS } from '@/constants/EventLogRetentionInDays';
import { EventLogTable } from '@/types/EventLogTable';
import { getEventLogRetentionInDays } from '@/utils/event-logs/getEventLogRetentionInDays';

describe('getEventLogRetentionInDays', () => {
  it('should keep application logs for a fixed duration', () => {
    expect(
      getEventLogRetentionInDays({
        table: EventLogTable.APPLICATION_LOG,
        workspaceRetentionInDays: 365,
        hasAuditLogsEntitlement: true,
      }),
    ).toBe(EVENT_LOG_RETENTION_IN_DAYS.applicationLog);
  });

  it('should use the workspace retention with the audit logs entitlement', () => {
    expect(
      getEventLogRetentionInDays({
        table: EventLogTable.OBJECT_EVENT,
        workspaceRetentionInDays: 365,
        hasAuditLogsEntitlement: true,
      }),
    ).toBe(365);
  });

  it('should use the default retention without the audit logs entitlement', () => {
    expect(
      getEventLogRetentionInDays({
        table: EventLogTable.OBJECT_EVENT,
        workspaceRetentionInDays: 365,
        hasAuditLogsEntitlement: false,
      }),
    ).toBe(EVENT_LOG_RETENTION_IN_DAYS.default);
  });
});
