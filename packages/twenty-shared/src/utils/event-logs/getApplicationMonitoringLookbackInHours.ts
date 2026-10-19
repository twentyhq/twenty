import { APPLICATION_MONITORING_RETENTION_IN_DAYS } from '@/constants/ApplicationMonitoringRetentionInDays';
import { EVENT_LOG_RETENTION } from '@/constants/EventLogRetention';

export const getApplicationMonitoringLookbackInHours = ({
  hasAuditLogsEntitlement,
}: {
  hasAuditLogsEntitlement: boolean;
}): number =>
  hasAuditLogsEntitlement
    ? APPLICATION_MONITORING_RETENTION_IN_DAYS * 24
    : EVENT_LOG_RETENTION.proPlanInHours;
