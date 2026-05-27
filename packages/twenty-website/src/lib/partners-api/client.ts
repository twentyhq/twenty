export const partnersApiFetch = async (
  path: string,
  init: RequestInit = {},
): Promise<unknown> => {
  const baseUrl = process.env.TWENTY_PARTNERS_API_URL;
  const apiKey = process.env.TWENTY_PARTNERS_API_KEY;
  if (!baseUrl) {
    throw new Error('Missing TWENTY_PARTNERS_API_URL env var');
  }
  if (!apiKey) {
    throw new Error('Missing TWENTY_PARTNERS_API_KEY env var');
  }

  const callerHeaders = Object.fromEntries(
    new Headers(init.headers ?? {}).entries(),
  );

  const base = baseUrl.replace(/\/$/, '');
  const response = await fetch(`${base}${path}`, {
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
