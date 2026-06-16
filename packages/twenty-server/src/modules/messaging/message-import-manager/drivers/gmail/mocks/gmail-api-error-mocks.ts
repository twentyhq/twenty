import { type GaxiosError } from 'gaxios';

import { createMockGaxiosError } from 'src/modules/messaging/message-import-manager/drivers/gmail/mocks/create-mock-gaxios-error.util';

type ErrorConfig = {
  reason: string;
  message: string;
};

const ERROR_DEFINITIONS: Record<number, Record<string, ErrorConfig>> = {
  400: {
    default: { reason: 'badRequest', message: 'Bad Request' },
    invalid_grant: { reason: 'invalid_grant', message: 'invalid_grant' },
    failedPrecondition: {
      reason: 'failedPrecondition',
      message: 'Precondition check failed.',
    },
  },
  401: {
    default: { reason: 'authError', message: 'Invalid Credentials' },
  },
  403: {
    default: { reason: 'rateLimitExceeded', message: 'Rate Limit Exceeded' },
    dailyLimit: {
      reason: 'dailyLimitExceeded',
      message: 'Daily Limit Exceeded',
    },
    userRateLimit: {
      reason: 'userRateLimitExceeded',
      message: 'User Rate Limit Exceeded',
    },
    rateLimit: { reason: 'rateLimitExceeded', message: 'Rate Limit Exceeded' },
    domainPolicy: { reason: 'domainPolicy', message: 'Domain Policy Error' },
  },
  404: {
    default: { reason: 'notFound', message: 'Not Found' },
  },
  410: {
    default: { reason: 'resourceGone', message: 'Resource Gone' },
  },
  429: {
    default: {
      reason: 'tooManyConcurrentRequests',
      message: 'Too Many Concurrent Requests',
    },
  },
  500: {
    default: { reason: 'backendError', message: 'Backend Error' },
  },
};

export const getGmailApiError = ({
  code,
  reason,
  message,
}: {
  code: number;
  reason?: string;
  message?: string;
}): GaxiosError => {
  const statusMap = ERROR_DEFINITIONS[code];

  if (!statusMap) {
    throw new Error(`Unknown error code: ${code}`);
  }

  const config = statusMap[reason || ''] ?? statusMap.default;

  const errorMessage = message ?? config.message;

  return createMockGaxiosError({
    message: errorMessage,
    status: code,
    statusText: config.message,
    data: {
      error: {
        code,
        message: errorMessage,
        errors: [
          {
            message: errorMessage,
            reason: config.reason,
          },
        ],
      },
    },
  });
};
