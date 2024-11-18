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

export default ServerUrl;
