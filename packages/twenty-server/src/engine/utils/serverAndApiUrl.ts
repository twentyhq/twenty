// The url of the Server, should be exposed in a private network
const ServerUrl = (() => {
  let serverUrl = '';

  return {
    get: () => {
      if (serverUrl === '') {
        throw new Error('ServerUrl is not initialized. Call set() first.');
      }

      return serverUrl;
    },
    set: (url: string) => {
      serverUrl = url;
    },
  };
})();

// The url of the API callable from the public network
const ApiUrl = (() => {
  let apiUrl = '';

  return {
    get: () => {
      if (apiUrl === '') {
        throw new Error('apiUrl is not initialized. Call set() first.');
      }

      return apiUrl;
    },
    set: (url: string = ServerUrl.get()) => {
      apiUrl = url;
    },
  };
})();

export { ServerUrl, ApiUrl };
