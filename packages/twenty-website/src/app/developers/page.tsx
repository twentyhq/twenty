import DocsMain from '@/app/_components/docs/DocsMain';
import { getDocsArticles } from '@/content/user-guide/constants/getDocsArticles';

export const metadata = {
  title: 'Twenty - Docs',
  description: 'Twenty is a CRM designed to fit your unique business needs.',
  icons: '/images/core/logo.svg',
};

export default async function DocsHome() {
  const filePath = 'src/content/developers/';
  const docsArticleCards = getDocsArticles(filePath);

  return <DocsMain docsArticleCards={docsArticleCards} />;
}
