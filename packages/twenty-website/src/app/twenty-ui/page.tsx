import DocsMain from '@/app/_components/docs/DocsMain';
import { getDocsArticles } from '@/content/user-guide/constants/getDocsArticles';

export const metadata = {
  title: 'Twenty - Twenty UI',
  description: 'Twenty is a CRM designed to fit your unique business needs.',
  icons: '/images/core/logo.svg',
};

export const dynamic = 'force-dynamic';

export default async function TwentyUIHome() {
  const filePath = 'src/content/twenty-ui/';
  const docsArticleCards = getDocsArticles(filePath);

  return <DocsMain docsArticleCards={docsArticleCards} />;
}
