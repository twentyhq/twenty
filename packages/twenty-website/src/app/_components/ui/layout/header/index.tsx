import { desc } from 'drizzle-orm';

import { HeaderDesktop } from '@/app/_components/ui/layout/header/HeaderDesktop';
import { HeaderMobile } from '@/app/_components/ui/layout/header/HeaderMobile';
import { findOne } from '@/database/database';
import { githubStarsModel } from '@/database/model';

export const AppHeader = async () => {
  const githubStars = await findOne(
    githubStarsModel,
    desc(githubStarsModel.timestamp),
  );

  return (
    <>
      <HeaderDesktop numberOfStars={githubStars?.[0]?.numberOfStars} />
      <HeaderMobile numberOfStars={githubStars?.[0]?.numberOfStars} />
    </>
  );
};
