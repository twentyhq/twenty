import { cleanServerUrl } from 'src/utils/clean-server-url';

export const getServerUrl = ({
  serverUrlEnv,
  serverUrlFallback,
}: {
  serverUrlEnv?: string;
  serverUrlFallback: string;
}): string => {
  return cleanServerUrl(serverUrlEnv) || serverUrlFallback;
};
