// An enum rather than a literal union because it is exposed as a GraphQL enum.
export enum ApplicationHealthStatus {
  OK = 'OK',
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  NEUTRAL = 'NEUTRAL',
  UNKNOWN = 'UNKNOWN',
}
