import { HeaderDesktop } from '@/app/_components/ui/layout/header/HeaderDesktop';
import { HeaderMobile } from '@/app/_components/ui/layout/header/HeaderMobile';

export const AppHeader = async () => {
  // const githubStars = await findOne(
  //   githubStarsModel,
  //   desc(githubStarsModel.timestamp),
  // );
  const githubStars = [];

  return (
    <>
      <HeaderDesktop numberOfStars={githubStars?.[0]?.numberOfStars} />
      <HeaderMobile numberOfStars={githubStars?.[0]?.numberOfStars} />
    </>
  );
};
