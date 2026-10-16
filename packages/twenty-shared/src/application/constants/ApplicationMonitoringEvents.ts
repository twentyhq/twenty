export const APPLICATION_MONITORING_EVENTS = [
  'application.install.succeeded',
  'application.install.failed',
  'application.upgrade.succeeded',
  'application.upgrade.failed',
  'application.uninstall.succeeded',
  'application.uninstall.failed',
  'application.api.rate_limited',
  'application.server_route.unreachable',
] as const;

export type ApplicationMonitoringEvent =
  (typeof APPLICATION_MONITORING_EVENTS)[number];
