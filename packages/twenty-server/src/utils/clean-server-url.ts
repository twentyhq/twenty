export const cleanServerUrl = (serverUrlEnv?: string) => {
  if (serverUrlEnv?.endsWith('/'))
    return serverUrlEnv.substring(0, serverUrlEnv.length - 1);

  return serverUrlEnv;
};
