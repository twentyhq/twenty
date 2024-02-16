'use client';

import { ReactNode } from 'react';
import styled from '@emotion/styled';

import UserGuideSidebar from '@/app/components/user-guide/UserGuideSidebar';
import UserGuideTableContents from '@/app/components/user-guide/UserGuideTableContents';

const StyledContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default function UserGuideLayout({ children }: { children: ReactNode }) {
  return (
    <StyledContainer>
      <UserGuideSidebar />
      {children}
      <UserGuideTableContents />
    </StyledContainer>
  );
}
