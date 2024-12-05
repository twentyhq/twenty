// Gaxios Network Error Mocks
const gaxiosErrorMocks = {
  // Connection Reset Error
  connectionReset: {
    code: 'ECONNRESET',
    name: 'GaxiosError',
    message: 'socket hang up',
    status: null,
    config: {
      method: 'GET',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      headers: {
        Authorization: 'Bearer [TOKEN]',
        Accept: 'application/json',
      },
      timeout: 5000,
      responseType: 'json',
    },
    response: undefined,
  },

  // Host Not Found Error
  hostNotFound: {
    code: 'ENOTFOUND',
    name: 'GaxiosError',
    message: 'getaddrinfo ENOTFOUND gmail.googleapis.com',
    status: null,
    config: {
      method: 'GET',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      headers: {
        Authorization: 'Bearer [TOKEN]',
        Accept: 'application/json',
      },
      timeout: 5000,
      responseType: 'json',
    },
    response: undefined,
  },

  // Connection Aborted Error
  connectionAborted: {
    code: 'ECONNABORTED',
    name: 'GaxiosError',
    message: 'The request was aborted due to a timeout',
    status: null,
    config: {
      method: 'GET',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      headers: {
        Authorization: 'Bearer [TOKEN]',
        Accept: 'application/json',
      },
      timeout: 5000,
      responseType: 'json',
    },
    response: undefined,
  },

  // Timeout Error
  timeout: {
    code: 'ETIMEDOUT',
    name: 'GaxiosError',
    message: 'Connection timed out after 5000ms',
    status: null,
    config: {
      method: 'GET',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      headers: {
        Authorization: 'Bearer [TOKEN]',
        Accept: 'application/json',
      },
      timeout: 5000,
      responseType: 'json',
    },
    response: undefined,
  },

  // Network Error
  networkError: {
    code: 'ERR_NETWORK',
    name: 'GaxiosError',
    message: 'Network Error',
    status: null,
    config: {
      method: 'GET',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      headers: {
        Authorization: 'Bearer [TOKEN]',
        Accept: 'application/json',
      },
      timeout: 5000,
      responseType: 'json',
    },
    response: undefined,
  },

  // Helper function to get error by code
  getError: function (code: string) {
    switch (code) {
      case 'ECONNRESET':
        return this.connectionReset;
      case 'ENOTFOUND':
        return this.hostNotFound;
      case 'ECONNABORTED':
        return this.connectionAborted;
      case 'ETIMEDOUT':
        return this.timeout;
      case 'ERR_NETWORK':
        return this.networkError;
      default:
        throw new Error(`Unknown error code: ${code}`);
    }
  },
};

export default gaxiosErrorMocks;
