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

  convertToErrorWithErrorCodeStringOrNumber: function ({
    error,
    errorCodeAsString,
  }: {
    error: GmailApiError;
    errorCodeAsString: boolean;
  }): GmailApiError {
    return {
      code: errorCodeAsString ? error.code.toString() : error.code,
      message: error.message,
    };
  },

  getError: function ({
    code,
    type,
    errorCodeAsString = false,
  }: {
    code: number;
    type?: string;
    errorCodeAsString?: boolean;
  }): GmailApiError {
    switch (code) {
      case 400:
        switch (type) {
          case 'invalid_grant':
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.invalidGrant,
              errorCodeAsString,
            });
          case 'failedPrecondition':
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.failedPrecondition,
              errorCodeAsString,
            });
          default:
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.badRequest,
              errorCodeAsString,
            });
        }
      case 401:
        return this.convertToErrorWithErrorCodeStringOrNumber({
          error: this.invalidCredentials,
          errorCodeAsString,
        });
      case 403:
        switch (type) {
          case 'dailyLimit':
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.dailyLimitExceeded,
              errorCodeAsString,
            });
          case 'userRateLimit':
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.userRateLimitExceeded,
              errorCodeAsString,
            });
          case 'rateLimit':
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.rateLimitExceeded,
              errorCodeAsString,
            });
          case 'domainPolicy':
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.domainPolicyError,
              errorCodeAsString,
            });
          default:
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.rateLimitExceeded,
              errorCodeAsString,
            });
        }
      case 404:
        return this.convertToErrorWithErrorCodeStringOrNumber({
          error: this.notFound,
          errorCodeAsString,
        });
      case 410:
        return this.convertToErrorWithErrorCodeStringOrNumber({
          error: this.gone,
          errorCodeAsString,
        });
      case 429:
        switch (type) {
          case 'concurrent':
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.tooManyConcurrentRequests,
              errorCodeAsString,
            });
          case 'mailSending':
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.mailSendingLimitExceeded,
              errorCodeAsString,
            });
          default:
            return this.convertToErrorWithErrorCodeStringOrNumber({
              error: this.tooManyConcurrentRequests,
              errorCodeAsString,
            });
        }
      case 500:
        return this.convertToErrorWithErrorCodeStringOrNumber({
          error: this.backendError,
          errorCodeAsString,
        });
      default:
        throw new Error(`Unknown error code: ${code}`);
    }
  },
};

export default gmailApiErrorMocks;
