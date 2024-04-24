import { HeaderDesktop } from '@/app/_components/ui/layout/header/HeaderDesktop';
import { HeaderMobile } from '@/app/_components/ui/layout/header/HeaderMobile';
import { fetchStargazerCount } from '@/app/_server-utils/fetch-stargazers-count';

export const AppHeader = async () => {
  const stars = await fetchStargazerCount();

  return (
    <>
      <HeaderDesktop stars={stars} />
      <HeaderMobile stars={stars} />
    </>
  );
};
