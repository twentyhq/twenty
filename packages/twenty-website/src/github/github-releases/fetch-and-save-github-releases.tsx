import { graphql } from '@octokit/graphql';

import { insertMany } from '@/database/database';
import { githubReleasesModel } from '@/database/model';
import { Repository } from '@/github/contributors/types';

export const fetchAndSaveGithubReleases = async (
  query: typeof graphql,
): Promise<void> => {
  const { repository } = await query<Repository>(`
        query {
          repository(owner: "twentyhq", name: "twenty") {
            releases(first: 100) {  
                nodes {
                  tagName
                  publishedAt
                }
            }
          }
        }
    `);

  await insertMany(githubReleasesModel, repository.releases.nodes, {
    onConflictKey: 'tagName',
  });
};
