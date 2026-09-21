import { isNonEmptyString, isObject } from '@sniptt/guards';

export const APPLICATION_HEALTH_CHECK_REPORTED_STATUSES = [
  'ok',
  'info',
  'error',
] as const;

export type ApplicationHealthCheckReportedStatus =
  (typeof APPLICATION_HEALTH_CHECK_REPORTED_STATUSES)[number];

export type ApplicationHealthCheckAction = {
  label: string;
  location?: string;
};

export type ApplicationHealthCheckResult =
  | { status: 'ok' }
  | {
      status: Exclude<ApplicationHealthCheckReportedStatus, 'ok'>;
      message: string;
      action?: ApplicationHealthCheckAction;
    };

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

  if (status !== 'info' && status !== 'error') {
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
