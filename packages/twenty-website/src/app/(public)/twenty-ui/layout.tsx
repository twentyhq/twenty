import { ReactNode } from 'react';

import { DocsMainLayout } from '@/app/_components/docs/DocsMainLayout';
import { getDocsArticles } from '@/content/user-guide/constants/getDocsArticles';

export default function TwentyUILayout({ children }: { children: ReactNode }) {
  const filePath = 'src/content/twenty-ui/';
  const getAllArticles = true;
  const docsIndex = getDocsArticles(filePath, getAllArticles);
  return <DocsMainLayout docsIndex={docsIndex}>{children}</DocsMainLayout>;
}
