import axios from 'axios';

export async function fetchGithubStarCount(): Promise<number | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      'https://api.github.com/repos/twentyhq/twenty',
      { headers },
    );

    return response.data.stargazers_count;
  } catch {
    return null;
  }
}
