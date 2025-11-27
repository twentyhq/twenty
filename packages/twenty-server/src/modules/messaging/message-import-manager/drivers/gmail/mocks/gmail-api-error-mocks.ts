import { type GmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-api-error.type';

const gmailApiErrorMocks = {
  // 400 Bad Request - Invalid query parameters
  badRequest: {
    code: '400',
    message: 'badRequest',
  },

  // 400 Invalid Grant
  invalidGrant: {
    code: '400',
    message: 'invalid_grant',
  },

  // 400 Failed Precondition
  failedPrecondition: {
    code: '400',
    message: 'failedPrecondition',
  },

  invalidCredentials: {
    code: '401',
    message: 'authError',
  },

  notFound: {
    code: '404',
    message: 'notFound',
  },

  gone: {
    code: '410',
    message: 'resourceGone',
  },

  dailyLimitExceeded: {
    code: '403',
    message: 'dailyLimitExceeded',
  },

  userRateLimitExceeded: {
    code: '403',
    message: 'userRateLimitExceeded',
  },

  rateLimitExceeded: {
    code: '403',
    message: 'rateLimitExceeded',
  },

  domainPolicyError: {
    code: '403',
    message: 'domainPolicy',
  },

  tooManyConcurrentRequests: {
    code: '429',
    message: 'tooManyConcurrentRequests',
  },

  backendError: {
    code: '500',
    message: 'backendError',
  },

  getError: function (code: number, type?: string): GmailApiError {
    switch (code) {
      case 400:
        switch (type) {
          case 'invalid_grant':
            return this.invalidGrant;
          case 'failedPrecondition':
            return this.failedPrecondition;
          default:
            return this.badRequest;
        }
      case 401:
        return this.invalidCredentials;
      case 403:
        switch (type) {
          case 'dailyLimit':
            return this.dailyLimitExceeded;
          case 'userRateLimit':
            return this.userRateLimitExceeded;
          case 'rateLimit':
            return this.rateLimitExceeded;
          case 'domainPolicy':
            return this.domainPolicyError;
          default:
            return this.rateLimitExceeded;
        }
      case 404:
        return this.notFound;
      case 410:
        return this.gone;
      case 429:
        switch (type) {
          case 'concurrent':
            return this.tooManyConcurrentRequests;
          case 'mailSending':
            return this.mailSendingLimitExceeded;
          default:
            return this.tooManyConcurrentRequests;
        }
      case 500:
        return this.backendError;
      default:
        throw new Error(`Unknown error code: ${code}`);
    }
  },
};

export default gmailApiErrorMocks;
