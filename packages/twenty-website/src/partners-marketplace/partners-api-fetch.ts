// Authed GET against the Twenty partners API. Env-gated: throws when the env is
// missing so the seam's catch can fall back to [] cleanly.
//
// Never cached. Every payload embeds file URLs signed with a token that expires
// in 24h, so a Data Cache entry outliving its tokens serves a page of 403s.
export async function partnersApiFetch(path: string): Promise<unknown> {
  const baseUrl = process.env.TWENTY_PARTNERS_API_URL;
  const apiKey = process.env.TWENTY_PARTNERS_API_KEY;
  if (baseUrl === undefined || apiKey === undefined) {
    throw new Error('TWENTY_PARTNERS_API_URL / TWENTY_PARTNERS_API_KEY unset');
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Twenty partners API ${response.status} ${path}: ${body.slice(0, 300)}`,
    );
  }

  return response.json();
}
