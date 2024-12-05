// Gmail API Error Response Mocks for users.messages.list
const gmailApiErrorMocks = {
  // 400 Bad Request - Invalid query parameters
  badRequest: {
    error: {
      code: 400,
      errors: [
        {
          domain: 'global',
          location: 'orderBy',
          locationType: 'parameter',
          message:
            'Sorting is not supported for queries with fullText terms. Results are always in descending relevance order.',
          reason: 'badRequest',
        },
      ],
      message:
        'Sorting is not supported for queries with fullText terms. Results are always in descending relevance order.',
    },
  },

  // 400 Invalid Grant
  invalidGrant: {
    error: {
      code: 400,
      errors: [
        {
          domain: 'global',
          reason: 'invalid_grant',
          message: 'Invalid Credentials',
        },
      ],
      message: 'Invalid Credentials',
    },
  },

  // 400 Failed Precondition
  failedPrecondition: {
    error: {
      code: 400,
      errors: [
        {
          domain: 'global',
          reason: 'failedPrecondition',
          message: 'Failed Precondition',
        },
      ],
      message: 'Failed Precondition',
    },
  },

  // 401 Invalid Credentials
  invalidCredentials: {
    error: {
      errors: [
        {
          domain: 'global',
          reason: 'authError',
          message: 'Invalid Credentials',
          locationType: 'header',
          location: 'Authorization',
        },
      ],
      code: 401,
      message: 'Invalid Credentials',
    },
  },

  // 404 Not Found
  notFound: {
    error: {
      errors: [
        {
          domain: 'global',
          reason: 'notFound',
          message: 'Resource not found: userId',
          location: 'userId',
          locationType: 'parameter',
        },
      ],
      code: 404,
      message: 'Resource not found: userId',
    },
  },

  // 410 Gone
  gone: {
    error: {
      errors: [
        {
          domain: 'global',
          reason: 'resourceGone',
          message: 'Resource has been deleted',
          location: 'messageId',
          locationType: 'parameter',
        },
      ],
      code: 410,
      message: 'Resource has been deleted',
    },
  },

  // 403 Daily Limit Exceeded
  dailyLimitExceeded: {
    error: {
      errors: [
        {
          domain: 'usageLimits',
          reason: 'dailyLimitExceeded',
          message: 'Daily Limit Exceeded',
        },
      ],
      code: 403,
      message: 'Daily Limit Exceeded',
    },
  },

  // 403 User Rate Limit Exceeded
  userRateLimitExceeded: {
    error: {
      errors: [
        {
          domain: 'usageLimits',
          reason: 'userRateLimitExceeded',
          message: 'User Rate Limit Exceeded',
        },
      ],
      code: 403,
      message: 'User Rate Limit Exceeded',
    },
  },

  // 403 Rate Limit Exceeded
  rateLimitExceeded: {
    error: {
      errors: [
        {
          domain: 'usageLimits',
          reason: 'rateLimitExceeded',
          message: 'Rate Limit Exceeded',
        },
      ],
      code: 403,
      message: 'Rate Limit Exceeded',
    },
  },

  // 403 Domain Policy Error
  domainPolicyError: {
    error: {
      errors: [
        {
          domain: 'global',
          reason: 'domainPolicy',
          message: 'The domain administrators have disabled Gmail apps.',
        },
      ],
      code: 403,
      message: 'The domain administrators have disabled Gmail apps.',
    },
  },

  // 429 Too Many Requests (Concurrent Requests)
  tooManyConcurrentRequests: {
    error: {
      errors: [
        {
          domain: 'global',
          reason: 'rateLimitExceeded',
          message: 'Too many concurrent requests for user',
        },
      ],
      code: 429,
      message: 'Too many concurrent requests for user',
    },
  },

  // 500 Backend Error
  backendError: {
    error: {
      errors: [
        {
          domain: 'global',
          reason: 'backendError',
          message: 'Backend Error',
        },
      ],
      code: 500,
      message: 'Backend Error',
    },
  },

  getError: function (code: number, type?: string) {
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
