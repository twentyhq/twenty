import { type graphql } from '@octokit/graphql';

import { type Repository } from '@/github/contributors/types';

export async function fetchAssignableUsers(
  query: typeof graphql,
): Promise<Set<string>> {
  const { repository } = await query<Repository>(`
      query {
        repository(owner: "twentyhq", name: "twenty") {
          assignableUsers(first: 100) {
            nodes {
              login
            }
          }
        }
      }
    `);

  return new Set(repository.assignableUsers.nodes.map((user) => user.login));
}
