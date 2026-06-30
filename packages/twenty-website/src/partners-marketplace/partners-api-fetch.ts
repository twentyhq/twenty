// Authed GET against the Twenty partners API, cached at the fetch layer (the
// house pattern — no unstable_cache wrapper). Env-gated: throws when the env is
// missing so the seam's catch can fall back to [] cleanly.
const REVALIDATE_SECONDS = 300;

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
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Twenty partners API ${response.status} ${path}: ${body.slice(0, 300)}`,
    );
  }

  return response.json();
}
