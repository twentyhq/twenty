import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

const TRANSIENT_POSTGRES_CONNECTION_ERROR_CODES = new Set<string>([
  POSTGRESQL_ERROR_CODES.CONNECTION_EXCEPTION,
  POSTGRESQL_ERROR_CODES.CONNECTION_DOES_NOT_EXIST,
  POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE,
  POSTGRESQL_ERROR_CODES.SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION,
  POSTGRESQL_ERROR_CODES.SQLSERVER_REJECTED_ESTABLISHMENT_OF_SQLCONNECTION,
  POSTGRESQL_ERROR_CODES.TRANSACTION_RESOLUTION_UNKNOWN,
  POSTGRESQL_ERROR_CODES.PROTOCOL_VIOLATION,
  POSTGRESQL_ERROR_CODES.ADMIN_SHUTDOWN,
  POSTGRESQL_ERROR_CODES.CRASH_SHUTDOWN,
  POSTGRESQL_ERROR_CODES.CANNOT_CONNECT_NOW,
]);

const extractErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const errorRecord = error as {
    code?: unknown;
    driverError?: { code?: unknown };
  };

  if (typeof errorRecord.code === 'string') {
    return errorRecord.code;
  }

  if (typeof errorRecord.driverError?.code === 'string') {
    return errorRecord.driverError.code;
  }

  return undefined;
};

export const isTransientPostgresConnectionError = (
  error: unknown,
): boolean => {
  const errorCode = extractErrorCode(error);

  if (typeof errorCode !== 'string') {
    return false;
  }

  return TRANSIENT_POSTGRES_CONNECTION_ERROR_CODES.has(errorCode);
};
