import { graphql } from '@octokit/graphql';

import { Repository } from '@/app/contributors/api/types';
import { insertMany } from '@/database/database';
import { githubStarsModel } from '@/database/model';

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

  await insertMany(
    githubStarsModel,
    [
      {
        id: 1,
        numberOfStars,
      },
    ],
    { onConflictKey: 'id', onConflictUpdateObject: { numberOfStars } },
  );
};
