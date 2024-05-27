import { ReactNode } from 'react';

import { UserGuideMainLayout } from '@/app/_components/user-guide/UserGuideMainLayout';
import { getUserGuideArticles } from '@/content/user-guide/constants/getUserGuideArticles';

export default function DocsLayout({ children }: { children: ReactNode }) {
  const filePath = 'src/content/docs/';
  const getAllArticles = true;
  const userGuideIndex = getUserGuideArticles(filePath, getAllArticles);
  return (
    <UserGuideMainLayout userGuideIndex={userGuideIndex}>
      {children}
    </UserGuideMainLayout>
  );
}
