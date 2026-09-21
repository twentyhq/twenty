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
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { status, message, action } = value as Record<string, unknown>;

  if (status === 'ok') {
    return true;
  }

  if (status !== 'info' && status !== 'error') {
    return false;
  }

  if (typeof message !== 'string' || message.length === 0) {
    return false;
  }

  if (action === undefined) {
    return true;
  }

  if (typeof action !== 'object' || action === null) {
    return false;
  }

  const { label, location } = action as Record<string, unknown>;

  if (typeof label !== 'string' || label.length === 0) {
    return false;
  }

  if (location === undefined) {
    return true;
  }

  return typeof location === 'string' && location.length > 0;
};
