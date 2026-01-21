export const cleanServerUrl = (serverUrlEnv?: string): string | undefined => {
  if (!serverUrlEnv || typeof serverUrlEnv !== 'string') {
    return undefined;
  }

  const trimmed = serverUrlEnv.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.endsWith('/')
    ? trimmed.substring(0, trimmed.length - 1)
    : trimmed;
};
