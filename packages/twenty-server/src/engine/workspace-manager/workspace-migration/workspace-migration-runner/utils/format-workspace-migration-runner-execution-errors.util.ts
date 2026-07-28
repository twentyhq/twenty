import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { type WorkspaceMigrationRunnerExecutionErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

const MAX_EXECUTION_ERRORS_SUMMARY_LENGTH = 1_500;

const TRUNCATION_MARKER = ' [truncated]';

const POSTGRES_TRANSACTION_ABORTED_CODE = '25P02';

type ExecutionErrorEntry = {
  label: keyof WorkspaceMigrationRunnerExecutionErrors;
  error: Error;
};

const getPostgresDriverError = (
  error: Error,
): { code?: string; detail?: string } | undefined =>
  error instanceof QueryFailedError
    ? (error.driverError as { code?: string; detail?: string } | undefined)
    : undefined;

const isTransactionAbortedError = (error: Error): boolean =>
  getPostgresDriverError(error)?.code === POSTGRES_TRANSACTION_ABORTED_CODE;

const formatSingleExecutionError = (error: Error): string => {
  // Rejection reasons are typed as Error but nothing guarantees it at runtime.
  const baseMessage = error instanceof Error ? error.message : String(error);
  const driverError = getPostgresDriverError(error);
  const driverErrorParts = [
    isDefined(driverError?.code) ? `pg code: ${driverError.code}` : null,
    isDefined(driverError?.detail) ? `detail: ${driverError.detail}` : null,
  ].filter(isDefined);

  return driverErrorParts.length > 0
    ? `${baseMessage} (${driverErrorParts.join(', ')})`
    : baseMessage;
};

export const formatWorkspaceMigrationRunnerExecutionErrors = (
  errors: WorkspaceMigrationRunnerExecutionErrors,
): string | undefined => {
  const entries = (
    ['actionTranspilation', 'metadata', 'workspaceSchema'] as const
  )
    .map((label) => ({ label, error: errors[label] }))
    .filter((entry): entry is ExecutionErrorEntry => isDefined(entry.error));

  if (entries.length === 0) {
    return undefined;
  }

  // A 25P02 failure is collateral noise from the statement that aborted the
  // transaction; hide it whenever a root-cause error is available.
  const rootCauseEntries = entries.filter(
    (entry) => !isTransactionAbortedError(entry.error),
  );
  const relevantEntries =
    rootCauseEntries.length > 0 ? rootCauseEntries : entries;

  const summary = relevantEntries
    .map(
      (entry) => `[${entry.label}] ${formatSingleExecutionError(entry.error)}`,
    )
    .join('; ');

  return summary.length <= MAX_EXECUTION_ERRORS_SUMMARY_LENGTH
    ? summary
    : `${summary.slice(
        0,
        MAX_EXECUTION_ERRORS_SUMMARY_LENGTH - TRUNCATION_MARKER.length,
      )}${TRUNCATION_MARKER}`;
};
