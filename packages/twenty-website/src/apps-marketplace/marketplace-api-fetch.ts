const REVALIDATE_SECONDS = 300;

const DEFAULT_MARKETPLACE_API_URL = 'https://api.twenty.com';

export async function marketplaceGraphqlRequest<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const baseUrl =
    process.env.TWENTY_MARKETPLACE_API_URL ?? DEFAULT_MARKETPLACE_API_URL;

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/metadata`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Twenty marketplace API ${response.status}: ${body.slice(0, 300)}`,
    );
  }

  const json = (await response.json()) as {
    data?: TData;
    errors?: { message: string }[];
  };

  if (json.errors !== undefined && json.errors.length > 0) {
    throw new Error(
      `Twenty marketplace API errors: ${json.errors
        .map((error) => error.message)
        .join(', ')}`,
    );
  }

  if (json.data === undefined) {
    throw new Error('Twenty marketplace API returned no data');
  }

  return json.data;
}
