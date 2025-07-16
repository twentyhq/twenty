export const getServerUrl = (
  serverUrlEnv: string,
  serverUrlFallback: string,
): string => {
  if (serverUrlEnv?.endsWith('/'))
    return serverUrlEnv.substring(0, serverUrlEnv.length - 1);

  return serverUrlEnv || serverUrlFallback;
};
