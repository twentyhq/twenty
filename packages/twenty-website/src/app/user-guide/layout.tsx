import { ReactNode } from 'react';

import { UserGuideMainLayout } from '@/app/_components/user-guide/UserGuideMainLayout';
import { getUserGuideArticles } from '@/content/user-guide/constants/getUserGuideArticles';

export default function UserGuideLayout({ children }: { children: ReactNode }) {
  const userGuideIndex = getUserGuideArticles();
  return (
    <UserGuideMainLayout userGuideIndex={userGuideIndex}>
      {children}
    </UserGuideMainLayout>
  );
}
