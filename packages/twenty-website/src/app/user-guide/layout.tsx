'use client';
import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { usePathname } from 'next/navigation';

import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import UserGuideSidebar from '@/app/_components/user-guide/UserGuideSidebar';
import UserGuideTableContents from '@/app/_components/user-guide/UserGuideTableContents';
const StyledContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between: 
  border-bottom: 1px solid ${Theme.background.transparent.medium};
`;

const StyledEmptySideBar = styled.div`
  ${mq({
    width: '20%',
    display: ['none', 'none', ''],
  })};
`;

export default function UserGuideLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <StyledContainer>
      <UserGuideSidebar />
      {children}
      {pathname === '/user-guide' ? (
        <StyledEmptySideBar />
      ) : (
        <UserGuideTableContents />
      )}
    </StyledContainer>
  );
}
