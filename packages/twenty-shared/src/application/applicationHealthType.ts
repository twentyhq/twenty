export const APPLICATION_HEALTH_CHECK_REPORTED_STATUSES = [
  'ok',
  'warning',
  'error',
] as const;

export type ApplicationHealthCheckReportedStatus =
  (typeof APPLICATION_HEALTH_CHECK_REPORTED_STATUSES)[number];

export type ApplicationHealthCheckAction = {
  label: string;
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

  if (status !== 'warning' && status !== 'error') {
    return false;
  }

  if (typeof message !== 'string' || message.length === 0) {
    return false;
  }

  if (action === undefined) {
    return true;
  }

  return (
    typeof action === 'object' &&
    action !== null &&
    typeof (action as Record<string, unknown>).label === 'string'
  );
};
