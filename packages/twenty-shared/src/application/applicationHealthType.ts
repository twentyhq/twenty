import { isNonEmptyString, isObject } from '@sniptt/guards';

export const APPLICATION_HEALTH_CHECK_REPORTED_STATUSES = [
  'ok',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
] as const;

export type ApplicationHealthCheckReportedStatus =
  (typeof APPLICATION_HEALTH_CHECK_REPORTED_STATUSES)[number];

export type ApplicationHealthCheckReportedBannerStatus = Exclude<
  ApplicationHealthCheckReportedStatus,
  'ok'
>;

const APPLICATION_HEALTH_CHECK_REPORTED_BANNER_STATUSES: readonly string[] =
  APPLICATION_HEALTH_CHECK_REPORTED_STATUSES.filter(
    (status) => status !== 'ok',
  );

export type ApplicationHealthCheckAction = {
  label: string;
  location?: string;
};

export type ApplicationHealthCheckResult =
  | { status: 'ok' }
  | {
      status: ApplicationHealthCheckReportedBannerStatus;
      message: string;
      action?: ApplicationHealthCheckAction;
    };

const isApplicationHealthCheckReportedBannerStatus = (
  value: unknown,
): value is ApplicationHealthCheckReportedBannerStatus =>
  isNonEmptyString(value) &&
  APPLICATION_HEALTH_CHECK_REPORTED_BANNER_STATUSES.includes(value);

export const isApplicationHealthCheckResult = (
  value: unknown,
): value is ApplicationHealthCheckResult => {
  if (!isObject(value)) {
    return false;
  }

  const { status, message, action } = value as Record<string, unknown>;

  if (status === 'ok') {
    return true;
  }

  if (!isApplicationHealthCheckReportedBannerStatus(status)) {
    return false;
  }

  if (!isNonEmptyString(message)) {
    return false;
  }

  if (action === undefined) {
    return true;
  }

  if (!isObject(action)) {
    return false;
  }

  const { label, location } = action as Record<string, unknown>;

  if (!isNonEmptyString(label)) {
    return false;
  }

  return location === undefined || isNonEmptyString(location);
};
