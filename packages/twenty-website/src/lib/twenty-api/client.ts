const readRequiredEnv = (name: 'TWENTY_API_URL' | 'TWENTY_API_KEY'): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} env var`);
  }
  return value;
};

export const twentyFetch = async (
  path: string,
  init: RequestInit = {},
): Promise<unknown> => {
  const baseUrl = readRequiredEnv('TWENTY_API_URL');
  const apiKey = readRequiredEnv('TWENTY_API_KEY');

  const callerHeaders =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : ((init.headers as Record<string, string> | undefined) ?? {});

  const response = await fetch(`${baseUrl}${path}`, {
    cache: 'no-store',
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      ...callerHeaders,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Twenty API request failed: ${response.status} ${path} — ${body.slice(0, 500)}`,
    );
  }

  return response.json();
};
