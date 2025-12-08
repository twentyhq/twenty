import { type GmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-api-error.type';

const gmailApiErrorMocks = {
  // 400 Bad Request - Invalid query parameters
  badRequest: {
    code: 400,
    message: 'badRequest',
  },

  // 400 Invalid Grant
  invalidGrant: {
    code: 400,
    message: 'invalid_grant',
  },

  // 400 Failed Precondition
  failedPrecondition: {
    code: 400,
    message: 'failedPrecondition',
  },

  invalidCredentials: {
    code: 401,
    message: 'authError',
  },

  notFound: {
    code: 404,
    message: 'notFound',
  },

  gone: {
    code: 410,
    message: 'resourceGone',
  },

  dailyLimitExceeded: {
    code: 403,
    message: 'dailyLimitExceeded',
  },

  userRateLimitExceeded: {
    code: 403,
    message: 'userRateLimitExceeded',
  },

  rateLimitExceeded: {
    code: 403,
    message: 'rateLimitExceeded',
  },

  domainPolicyError: {
    code: 403,
    message: 'domainPolicy',
  },

  tooManyConcurrentRequests: {
    code: 429,
    message: 'tooManyConcurrentRequests',
  },

  backendError: {
    code: 500,
    message: 'backendError',
  },
};

const convertToErrorWithErrorCodeStringOrNumber = ({
  error,
  errorCodeAsString,
}: {
  error: GmailApiError;
  errorCodeAsString: boolean;
}): GmailApiError => {
  return {
    code: errorCodeAsString ? error.code.toString() : error.code,
    message: error.message,
  };
};

export const getGmailApiError = ({
  code,
  type,
  errorCodeAsString = false,
}: {
  code: number;
  type?: string;
  errorCodeAsString?: boolean;
}): GmailApiError => {
  switch (code) {
    case 400:
      switch (type) {
        case 'invalid_grant':
          return convertToErrorWithErrorCodeStringOrNumber({
            error: gmailApiErrorMocks.invalidGrant,
            errorCodeAsString,
          });
        case 'failedPrecondition':
          return convertToErrorWithErrorCodeStringOrNumber({
            error: gmailApiErrorMocks.failedPrecondition,
            errorCodeAsString,
          });
        default:
          return convertToErrorWithErrorCodeStringOrNumber({
            error: gmailApiErrorMocks.badRequest,
            errorCodeAsString,
          });
      }
    case 401:
      return convertToErrorWithErrorCodeStringOrNumber({
        error: gmailApiErrorMocks.invalidCredentials,
        errorCodeAsString,
      });
    case 403:
      switch (type) {
        case 'dailyLimit':
          return convertToErrorWithErrorCodeStringOrNumber({
            error: gmailApiErrorMocks.dailyLimitExceeded,
            errorCodeAsString,
          });
        case 'userRateLimit':
          return convertToErrorWithErrorCodeStringOrNumber({
            error: gmailApiErrorMocks.userRateLimitExceeded,
            errorCodeAsString,
          });
        case 'rateLimit':
          return convertToErrorWithErrorCodeStringOrNumber({
            error: gmailApiErrorMocks.rateLimitExceeded,
            errorCodeAsString,
          });
        case 'domainPolicy':
          return convertToErrorWithErrorCodeStringOrNumber({
            error: gmailApiErrorMocks.domainPolicyError,
            errorCodeAsString,
          });
        default:
          return convertToErrorWithErrorCodeStringOrNumber({
            error: gmailApiErrorMocks.rateLimitExceeded,
            errorCodeAsString,
          });
      }
    case 404:
      return convertToErrorWithErrorCodeStringOrNumber({
        error: gmailApiErrorMocks.notFound,
        errorCodeAsString,
      });
    case 410:
      return convertToErrorWithErrorCodeStringOrNumber({
        error: gmailApiErrorMocks.gone,
        errorCodeAsString,
      });
    case 429:
      switch (type) {
        case 'concurrent':
          return convertToErrorWithErrorCodeStringOrNumber({
            error: gmailApiErrorMocks.tooManyConcurrentRequests,
            errorCodeAsString,
          });
        default:
          return convertToErrorWithErrorCodeStringOrNumber({
            error: gmailApiErrorMocks.tooManyConcurrentRequests,
            errorCodeAsString,
          });
      }
    case 500:
      return convertToErrorWithErrorCodeStringOrNumber({
        error: gmailApiErrorMocks.backendError,
        errorCodeAsString,
      });
    default:
      throw new Error(`Unknown error code: ${code}`);
  }
};
