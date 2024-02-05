import Database from 'better-sqlite3';
import { Metadata } from 'next';

import { Background } from '@/app/components/oss-friends/Background';
import { ActivityLog } from '@/app/developers/contributors/[slug]/components/ActivityLog';
import { Breadcrumb } from '@/app/developers/contributors/[slug]/components/Breadcrumb';
import { ContentContainer } from '@/app/developers/contributors/[slug]/components/ContentContainer';
import { ProfileCard } from '@/app/developers/contributors/[slug]/components/ProfileCard';
import { ProfileInfo } from '@/app/developers/contributors/[slug]/components/ProfileInfo';
import { PullRequests } from '@/app/developers/contributors/[slug]/components/PullRequests';
import { ThankYou } from '@/app/developers/contributors/[slug]/components/ThankYou';

interface Contributor {
  login: string;
  avatarUrl: string;
  pullRequestCount: number;
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  return {
    title: params.slug + ' | Contributors',
  };
}

export default async function ({ params }: { params: { slug: string } }) {
  const db = new Database('db.sqlite', { readonly: true });

  const contributor = db
    .prepare(
      `
  SELECT 
    u.login,
    u.avatarUrl, 
    (SELECT COUNT(*) FROM pullRequests WHERE authorId = u.id) AS pullRequestCount,
    (SELECT COUNT(*) FROM issues WHERE authorId = u.id) AS issuesCount
  FROM 
    users u
  WHERE
    u.login = :user_id
`,
    )
    .get({ user_id: params.slug }) as Contributor;

  const pullRequestActivity = db
    .prepare(
      `
  SELECT 
    COUNT(*) as value,
    DATE(createdAt) as day
  FROM 
    pullRequests
  WHERE 
    authorId = (SELECT id FROM users WHERE login = :user_id)
  GROUP BY 
    DATE(createdAt)
  ORDER BY 
    DATE(createdAt)
`,
    )
    .all({ user_id: params.slug }) as { value: number; day: string }[];

  // Latest PRs.
  const pullRequestList = db
    .prepare(
      `
  SELECT 
    id,
    title,
    body,
    url,
    createdAt,
    updatedAt,
    closedAt,
    mergedAt,
    authorId
  FROM 
    pullRequests
  WHERE 
    authorId = (SELECT id FROM users WHERE login = :user_id)
  ORDER BY 
    DATE(createdAt) DESC
  LIMIT
    10
`,
    )
    .all({ user_id: params.slug }) as {
    title: string;
    createdAt: string;
    url: string;
    id: string;
    mergedAt: string | null;
    authorId: string;
  }[];

  const mergedPullRequests = db
    .prepare(
      `
  SELECT * FROM (
    SELECT 
      merged_pr_counts.*,
      (RANK() OVER(ORDER BY merged_count) - 1) / CAST( total_authors as float) * 100 as rank_percentage
    FROM
      (
       SELECT 
         authorId,
         COUNT(*) FILTER (WHERE mergedAt IS NOT NULL) as merged_count
       FROM 
         pullRequests pr
      JOIN 
         users u ON pr.authorId = u.id
       WHERE 
         u.isEmployee = FALSE
       GROUP BY 
         authorId
      ) AS merged_pr_counts
    CROSS JOIN 
      (
       SELECT COUNT(DISTINCT authorId) as total_authors
       FROM pullRequests pr
       JOIN 
          users u ON pr.authorId = u.id
      WHERE 
          u.isEmployee = FALSE
      ) AS author_counts
      ) WHERE authorId = (SELECT id FROM users WHERE login = :user_id)
  `,
    )
    .all({ user_id: params.slug }) as {
    merged_count: number;
    rank_percentage: number;
  }[];

  db.close();

  return (
    <>
      <Background />
      <ContentContainer>
        <Breadcrumb active={contributor.login} />
        <ProfileCard
          username={contributor.login}
          avatarUrl={contributor.avatarUrl}
          firstContributionAt={pullRequestActivity[0].day}
        />
        <ProfileInfo
          mergedPRsCount={mergedPullRequests[0].merged_count}
          rank={(100 - Number(mergedPullRequests[0].rank_percentage)).toFixed(
            0,
          )}
          activeDays={pullRequestActivity.length}
        />
        <ActivityLog data={pullRequestActivity} />
        <PullRequests list={pullRequestList} />
        <ThankYou authorId={contributor.login} />
      </ContentContainer>
    </>
  );
}
