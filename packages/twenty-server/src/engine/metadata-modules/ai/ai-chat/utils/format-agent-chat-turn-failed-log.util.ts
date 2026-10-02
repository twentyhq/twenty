import { AISDKError } from 'ai';
import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { type QueryFailedErrorWithCode } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { getAiSdkErrorFingerprint } from 'src/engine/core-modules/exception-handler/utils/get-ai-sdk-error-fingerprint.util';

const MAX_ERROR_CHAIN_LENGTH = 5;
const MAX_CAUSE_LENGTH = 2000;

const listErrorChain = (error: unknown): unknown[] => {
  const chain: unknown[] = [];
  let current = error;

  while (isDefined(current) && chain.length < MAX_ERROR_CHAIN_LENGTH) {
    chain.push(current);
    current =
      current instanceof Error && 'cause' in current
        ? current.cause
        : undefined;
  }

  return chain;
};

const getPostgresCode = (error: unknown): string | undefined => {
  if (error instanceof PostgresException) {
    return error.code;
  }

  if (error instanceof QueryFailedError) {
    return (error as QueryFailedErrorWithCode).code;
  }

  return undefined;
};

const describeError = (error: unknown): string =>
  error instanceof Error ? `${error.name}: ${error.message}` : String(error);

export const formatAgentChatTurnFailedLog = ({
  threadId,
  workspaceId,
  streamId,
  model,
  failurePhase,
  errorCode,
  error,
}: {
  threadId: string;
  workspaceId: string;
  streamId?: string | null;
  model?: string;
  failurePhase: string;
  errorCode?: string;
  error?: unknown;
}): string => {
  const chain = listErrorChain(error);
  const aiSdkError = chain.find((link) => AISDKError.isInstance(link));
  const cause = chain.map(describeError).join(' <- ');

  const fields = {
    threadId,
    workspaceId,
    streamId,
    model,
    failurePhase,
    errorCode,
    postgresCode: chain.map(getPostgresCode).find(isDefined),
    aiSdkError: isDefined(aiSdkError)
      ? getAiSdkErrorFingerprint(aiSdkError).slice(1).join('/')
      : undefined,
    cause:
      chain.length > 0
        ? JSON.stringify(cause.slice(0, MAX_CAUSE_LENGTH))
        : undefined,
  };

  return `[AI_CHAT_TURN_FAILED] ${Object.entries(fields)
    .filter(([, value]) => isDefined(value))
    .map(([key, value]) => `${key}=${value}`)
    .join(' ')}`;
};
