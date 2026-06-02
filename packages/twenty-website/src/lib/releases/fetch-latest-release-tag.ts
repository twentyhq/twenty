export async function fetchLatestGithubReleaseTag(): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      'https://api.github.com/repos/twentyhq/twenty/releases/latest',
      { headers },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { tag_name?: string };
    return data.tag_name ?? null;
  } catch {
    return null;
  }
}
