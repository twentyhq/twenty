import Database from 'better-sqlite3';

import AvatarGrid from '@/app/components/AvatarGrid';
import { Header } from '@/app/components/developers/contributors/Header';
import { Background } from '@/app/components/oss-friends/Background';
import { ContentContainer } from '@/app/components/oss-friends/ContentContainer';

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
      WHERE 
          u.isEmployee = FALSE
      AND u.login NOT IN ('dependabot', 'cyborch', 'emilienchvt', 'Samox')
      GROUP BY 
          u.id
      ORDER BY 
          pullRequestCount DESC;
        `,
    )
    .all() as Contributor[];

  db.close();

  return (
    <>
      <Background />
      <ContentContainer>
        <Header />
        <div>
          <AvatarGrid users={contributors} />
        </div>
      </ContentContainer>
    </>
  );
};

export default Contributors;
