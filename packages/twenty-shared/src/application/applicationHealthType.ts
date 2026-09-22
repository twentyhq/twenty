import { isNonEmptyString, isObject } from '@sniptt/guards';

import { ApplicationHealthStatus } from './applicationHealthStatus';

// The string form of the enum, so an app can write either 'WARNING' or
// ApplicationHealthStatus.WARNING. UNKNOWN is Twenty's answer to a check it
// could not read, never something an app reports.
export type ApplicationHealthCheckReportedStatus = Exclude<
  `${ApplicationHealthStatus}`,
  `${ApplicationHealthStatus.UNKNOWN}`
>;

export type ApplicationHealthCheckReportedBannerStatus = Exclude<
  ApplicationHealthCheckReportedStatus,
  `${ApplicationHealthStatus.OK}`
>;

const APPLICATION_HEALTH_CHECK_REPORTED_BANNER_STATUSES: readonly string[] =
  Object.values(ApplicationHealthStatus).filter(
    (status) =>
      status !== ApplicationHealthStatus.OK &&
      status !== ApplicationHealthStatus.UNKNOWN,
  );

export type ApplicationHealthCheckAction = {
  label: string;
  location?: string;
};

export type ApplicationHealthCheckResult =
  | { status: `${ApplicationHealthStatus.OK}` }
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

  if (status === ApplicationHealthStatus.OK) {
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
