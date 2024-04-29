import UserGuideMain from '@/app/_components/user-guide/UserGuideMain';
import { getUserGuideArticles } from '@/content/user-guide/constants/getUserGuideArticles';

export const metadata = {
  title: 'Twenty - User Guide',
  description:
    'Discover how to use Twenty CRM effectively with our detailed user guide. Explore ways to customize features, manage tasks, integrate emails, and navigate the system with ease.',
  icons: '/images/core/logo.svg',
};

export const dynamic = 'force-dynamic';

export default async function UserGuideHome() {
  const userGuideArticleCards = getUserGuideArticles();

  return <UserGuideMain userGuideArticleCards={userGuideArticleCards} />;
}
