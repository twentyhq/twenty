import Database from 'better-sqlite3';

import AvatarGrid from '@/app/components/AvatarGrid';

interface Contributor {
  login: string;
  avatarUrl: string;
  pullRequestCount: number;
}

const Contributors = async () => {
  const db = new Database('db.sqlite', { readonly: true });

  const contributors = db
    .prepare(
      `SELECT 
          u.login,
          u.avatarUrl, 
          COUNT(pr.id) AS pullRequestCount
        FROM 
          users u
        JOIN 
          pullRequests pr ON u.id = pr.authorId
        GROUP BY 
          u.id
        ORDER BY 
          pullRequestCount DESC;
        `,
    )
    .all() as Contributor[];

  db.close();

  return (
    <div>
      <AvatarGrid users={contributors} />
    </div>
  );
};

export default Contributors;
