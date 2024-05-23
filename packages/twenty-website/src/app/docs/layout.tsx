import { ReactNode } from 'react';

import { UserGuideMainLayout } from '@/app/_components/user-guide/UserGuideMainLayout';
import { getUserGuideArticles } from '@/content/user-guide/constants/getUserGuideArticles';

export default function DocsLayout({ children }: { children: ReactNode }) {
  const filePath = 'src/content/docs/';
  const userGuideIndex = getUserGuideArticles(filePath);
  return (
    <UserGuideMainLayout userGuideIndex={userGuideIndex}>
      {children}
    </UserGuideMainLayout>
  );
}
