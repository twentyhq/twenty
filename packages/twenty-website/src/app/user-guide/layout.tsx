'use client';
import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { usePathname } from 'next/navigation';

import {
  DeviceType,
  useDeviceType,
} from '@/app/_components/client-utils/useDeviceType';
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
  width: 20%;
`;

export default function UserGuideLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const deviceType = useDeviceType();

  return (
    <StyledContainer>
      {deviceType !== DeviceType.MOBILE && <UserGuideSidebar />}
      {children}
      {deviceType !== DeviceType.DESKTOP ? (
        <></>
      ) : pathname === '/user-guide' ? (
        <StyledEmptySideBar />
      ) : (
        <UserGuideTableContents />
      )}
    </StyledContainer>
  );
}
