const getBundle = (inputData?: object) => {
  return {
    authData: { apiKey: String(process.env.API_KEY) },
    inputData,
    cleanedRequest: {}

  };
};
export default getBundle;
