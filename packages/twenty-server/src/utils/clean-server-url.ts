export const cleanServerUrl = (serverUrlEnv?: string): string => {
  if (!serverUrlEnv || typeof serverUrlEnv !== 'string') {
    return '';
  }

  const trimmed = serverUrlEnv.trim();

  if (!trimmed) {
    return '';
  }

  return trimmed.endsWith('/')
    ? trimmed.substring(0, trimmed.length - 1)
    : trimmed;
};
