import { EVENT_LOG_RETENTION } from '@/constants/EventLogRetention';
import { getEventLogRetentionInHours } from '@/utils/event-logs/getEventLogRetentionInHours';

describe('getEventLogRetentionInHours', () => {
  it('should keep logs for the Pro plan duration without the audit logs entitlement', () => {
    expect(
      getEventLogRetentionInHours({
        workspaceRetentionInDays: 365,
        hasAuditLogsEntitlement: false,
      }),
    ).toBe(EVENT_LOG_RETENTION.proPlanInHours);
  });

  it('should use the workspace retention with the audit logs entitlement', () => {
    expect(
      getEventLogRetentionInHours({
        workspaceRetentionInDays: 365,
        hasAuditLogsEntitlement: true,
      }),
    ).toBe(365 * 24);
  });

  it('should cap the workspace retention at the maximum retention', () => {
    expect(
      getEventLogRetentionInHours({
        workspaceRetentionInDays: 5000,
        hasAuditLogsEntitlement: true,
      }),
    ).toBe(EVENT_LOG_RETENTION.maxInDays * 24);
  });
});
