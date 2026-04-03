export async function fetchLatestGithubReleaseTag(): Promise<string | null> {
  try {
    const response = await fetch(
      'https://api.github.com/repos/twentyhq/twenty/releases/latest',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { tag_name?: unknown };
    return typeof data.tag_name === 'string' ? data.tag_name : null;
  } catch {
    return null;
  }
}
