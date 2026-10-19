import { APPLICATION_MONITORING_RETENTION_IN_DAYS } from '@/constants/ApplicationMonitoringRetentionInDays';
import { EVENT_LOG_RETENTION } from '@/constants/EventLogRetention';
import { getApplicationMonitoringLookbackInHours } from '@/utils/event-logs/getApplicationMonitoringLookbackInHours';

describe('getApplicationMonitoringLookbackInHours', () => {
  it('should cap Pro plans at their log retention', () => {
    expect(
      getApplicationMonitoringLookbackInHours({
        hasAuditLogsEntitlement: false,
      }),
    ).toBe(EVENT_LOG_RETENTION.proPlanInHours);
  });

  it('should give the full monitoring retention with the audit logs entitlement', () => {
    expect(
      getApplicationMonitoringLookbackInHours({
        hasAuditLogsEntitlement: true,
      }),
    ).toBe(APPLICATION_MONITORING_RETENTION_IN_DAYS * 24);
  });
});
