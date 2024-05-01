'use client';
import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { usePathname } from 'next/navigation';

import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import UserGuideTableContents from '@/app/_components/user-guide/TableContent';
import UserGuideSidebar from '@/app/_components/user-guide/UserGuideSidebar';
import { UserGuideArticlesProps } from '@/content/user-guide/constants/getUserGuideArticles';

const StyledContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid ${Theme.background.transparent.medium};
  min-height: calc(100vh - 50px);
`;

const StyledEmptySideBar = styled.div`
  ${mq({
    width: '20%',
    display: ['none', 'none', ''],
  })};
`;

export const UserGuideMainLayout = ({
  children,
  userGuideIndex,
}: {
  children: ReactNode;
  userGuideIndex: UserGuideArticlesProps[];
}) => {
  const pathname = usePathname();
  return (
    <StyledContainer>
      <UserGuideSidebar userGuideIndex={userGuideIndex} />
      {children}
      {pathname === '/user-guide' ? (
        <StyledEmptySideBar />
      ) : (
        <UserGuideTableContents />
      )}
    </StyledContainer>
  );
};
