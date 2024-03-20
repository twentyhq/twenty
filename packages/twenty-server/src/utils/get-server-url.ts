import { Request } from 'express';

export const getServerUrl = (
  request: Request,
  serverUrlEnv: string,
): string => {
  if (serverUrlEnv?.endsWith('/'))
    return serverUrlEnv.substring(0, serverUrlEnv.length - 1);

  return serverUrlEnv || `${request.protocol}://${request.get('host')}`;
};
