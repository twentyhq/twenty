import { type graphql } from '@octokit/graphql';

import { insertMany } from '@/database/database';
import { githubStarsModel } from '@/database/model';
import { type Repository } from '@/github/contributors/types';

export const fetchAndSaveGithubStars = async (
  query: typeof graphql,
): Promise<void> => {
  const { repository } = await query<Repository>(`
        query {
          repository(owner: "twentyhq", name: "twenty") {
            stargazers {
              totalCount
            }
          }
        }
    `);

  const numberOfStars = repository.stargazers.totalCount;

  await insertMany(githubStarsModel, [
    {
      numberOfStars,
    },
  ]);
};
