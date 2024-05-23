import DocsMain from '@/app/_components/docs/DocsMain';
import { getUserGuideArticles } from '@/content/user-guide/constants/getUserGuideArticles';

export const metadata = {
  title: 'Twenty - User Guide',
  description: 'Twenty is a CRM designed to fit your unique business needs.',
  icons: '/images/core/logo.svg',
};

export const dynamic = 'force-dynamic';

export default async function DocsHome() {
  const filePath = 'src/content/docs/';
  const userGuideArticleCards = getUserGuideArticles(filePath);

  return <DocsMain userGuideArticleCards={userGuideArticleCards} />;
}
