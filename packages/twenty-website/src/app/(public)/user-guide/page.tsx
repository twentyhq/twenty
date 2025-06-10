import DocsMain from '@/app/_components/docs/DocsMain';
import { getDocsArticles } from '@/content/user-guide/constants/getDocsArticles';

export const metadata = {
  title: 'Twenty - User Guide',
  description:
    'Discover how to use Twenty CRM effectively with our detailed user guide. Explore ways to customize features, manage tasks, integrate emails, and navigate the system with ease.',
  icons: '/images/core/logo.svg',
};

export default async function UserGuideHome() {
  const filePath = 'src/content/user-guide/';
  const docsArticleCards = getDocsArticles(filePath);

  return <DocsMain docsArticleCards={docsArticleCards} />;
}
