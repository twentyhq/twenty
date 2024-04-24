export async function fetchStargazerCount(): Promise<string | null> {
  /**
   * Fetch the stargazers count from the GitHub API and revaildate every 1 hour
   * to avoid hitting the rate limit
   */
  try {
    const res = await fetch('https://api.github.com/repos/twentyhq/twenty', {
      next: { revalidate: 3600 },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return formatNumber(data.stargazers_count) ?? null;
  } catch (error) {
    console.error('Failed to fetch stargazers count', error);
    return null;
  }
}

function formatNumber(num: number) {
  return num > 999 ? `${(num / 1000).toFixed(1)}k` : num.toString();
}
