import Database from 'better-sqlite3';
import { Metadata } from 'next';
import Image from 'next/image';

import { ActivityLog } from './components/ActivityLog';

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
    mergedAt
  FROM 
    pullRequests
  WHERE 
    authorId = (SELECT id FROM users WHERE login = :user_id)
  ORDER BY 
    DATE(createdAt) DESC
`,
    )
    .all({ user_id: params.slug }) as {
    title: string;
    createdAt: string;
    url: string;
  }[];

  db.close();

  return (
    <div
      style={{
        maxWidth: '900px',
        display: 'flex',
        padding: '40px',
        gap: '24px',
      }}
    >
      <div style={{ flexDirection: 'column', width: '240px' }}>
        <Image
          src={contributor.avatarUrl}
          alt={contributor.login}
          width={240}
          height={240}
        />
        <h1>{contributor.login}</h1>
      </div>
      <div style={{ flexDirection: 'column' }}>
        <div style={{ width: '450px', height: '200px' }}>
          <ActivityLog data={pullRequestActivity} />
        </div>
        <div style={{ width: '450px' }}>
          {pullRequestList.map((pr) => (
            <div>
              <a href={pr.url}>{pr.title}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
