import UserGuideMain from '@/app/_components/user-guide/UserGuideMain';
import { getUserGuideArticles } from '@/content/user-guide/constants/getUserGuideArticles';

export default async function UserGuideHome() {
  const userGuideArticleCards = getUserGuideArticles();

  return <UserGuideMain userGuideArticleCards={userGuideArticleCards} />;
}
