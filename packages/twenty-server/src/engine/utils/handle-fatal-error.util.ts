import process from 'process';

import * as Sentry from '@sentry/node';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';

import { shouldCaptureException } from './global-exception-handler.util';

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(String(error));
};

export const handleFatalError = ({
  error,
  context,
  logger,
  captureInSentry = true,
}: {
  error: unknown;
  context: string;
  logger?: LoggerService;
  captureInSentry?: boolean;
}) => {
  const normalizedError = toError(error);

  logger?.error(normalizedError.message, context, normalizedError.stack);

  if (!logger) {
    process.stderr.write(
      `[${context}] ${normalizedError.name}: ${normalizedError.message}\n${normalizedError.stack ?? ''}\n`,
    );
  }

  if (
    captureInSentry &&
    shouldCaptureException(normalizedError) &&
    Sentry.isInitialized()
  ) {
    Sentry.addBreadcrumb({
      category: 'startup',
      level: 'error',
      message: `${context} fatal error`,
      data: {
        errorName: normalizedError.name,
      },
    });

    Sentry.captureException(normalizedError);
  }
};
