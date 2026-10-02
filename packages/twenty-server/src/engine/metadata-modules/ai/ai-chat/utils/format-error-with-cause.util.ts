import { isDefined } from 'twenty-shared/utils';

const formatError = (error: unknown): string =>
  error instanceof Error ? `${error.name}: ${error.message}` : String(error);

// ORM and AI SDK wrappers keep the actual failure one level down in `cause`
export const formatErrorWithCause = (error: unknown): string =>
  error instanceof Error && 'cause' in error && isDefined(error.cause)
    ? `${formatError(error)} <- ${formatError(error.cause)}`
    : formatError(error);
