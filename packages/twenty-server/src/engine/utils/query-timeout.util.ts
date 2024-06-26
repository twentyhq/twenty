export const isQueryTimeoutError = (error: Error) => {
  return error.message.includes('Query read timeout');
};
