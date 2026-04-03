import { isExcludedContributorLogin } from '@/constants/contributor-exclusions';

const GITHUB_REPO = 'twentyhq/twenty';
const MAX_PAGES = 10;

type GitHubContributorJson = {
  avatar_url: string;
  contributions: number;
  html_url: string;
  login: string;
};

export type PublicRepoContributor = {
  avatarUrl: string;
  contributions: number;
  login: string;
  profileUrl: string;
};

export async function fetchPublicRepoContributors(): Promise<{
  contributors: PublicRepoContributor[];
  loadFailed: boolean;
}> {
  try {
    const aggregated: GitHubContributorJson[] = [];
    let page = 1;
    const perPage = 100;

    while (page <= MAX_PAGES) {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=${perPage}&page=${page}`,
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
        return { contributors: [], loadFailed: true };
      }

      const batch = (await response.json()) as unknown;
      if (!Array.isArray(batch) || batch.length === 0) {
        break;
      }

      for (const item of batch) {
        if (
          item &&
          typeof item === 'object' &&
          'login' in item &&
          typeof (item as GitHubContributorJson).login === 'string'
        ) {
          aggregated.push(item as GitHubContributorJson);
        }
      }

      if (batch.length < perPage) {
        break;
      }

      page += 1;
    }

    const contributors = aggregated
      .filter(
        (contributor) => !isExcludedContributorLogin(contributor.login),
      )
      .sort((a, b) => b.contributions - a.contributions)
      .map((contributor) => ({
        avatarUrl: contributor.avatar_url,
        contributions: contributor.contributions,
        login: contributor.login,
        profileUrl: contributor.html_url,
      }));

    return { contributors, loadFailed: false };
  } catch {
    return { contributors: [], loadFailed: true };
  }
}
