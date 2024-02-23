'use client';

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';

import UserGuideSidebarSection from '@/app/components/user-guide/UserGuideSidebarSection';
import { IconBook } from '@/app/ui/icons';
import { Theme } from '@/app/ui/theme/theme';
import { DeviceType, useDeviceType } from '@/app/ui/utilities/useDeviceType';
import { UserGuideIndex } from '@/app/user-guide/constants/UserGuideIndex';

const StyledContainer = styled.div<{ isTablet: boolean }>`
  width: ${({ isTablet }) => (isTablet ? '30%' : '20%')};
  background: ${Theme.background.secondary};
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${Theme.background.transparent.medium};
  border-bottom: 1px solid ${Theme.background.transparent.medium};
  padding: ${Theme.spacing(10)} ${Theme.spacing(3)};
  gap: ${Theme.spacing(6)};
`;

const StyledHeading = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${Theme.spacing(2)};
  font-size: ${Theme.font.size.sm};
  font-weight: ${Theme.font.weight.medium};
`;

const StyledIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-size: ${Theme.font.size.sm};
  font-weight: ${Theme.font.weight.medium};
  color: ${Theme.text.color.secondary};
  border: 1px solid ${Theme.text.color.secondary};
  border-radius: ${Theme.border.radius.sm};
  padding: ${Theme.spacing(1)} ${Theme.spacing(1)} ${Theme.spacing(1)}
    ${Theme.spacing(1)};
`;

const StyledHeadingText = styled.div`
  cursor: pointer;
  font-size: ${Theme.font.size.sm};
  font-weight: ${Theme.font.weight.medium};
`;

const UserGuideSidebar = () => {
  const router = useRouter();
  const isTablet = useDeviceType() === DeviceType.TABLET;
  return (
    <StyledContainer isTablet={isTablet}>
      <StyledHeading>
        <StyledIconContainer>
          <IconBook size={Theme.icon.size.md} />
        </StyledIconContainer>
        <StyledHeadingText onClick={() => router.push('/user-guide')}>
          User Guide
        </StyledHeadingText>
      </StyledHeading>
      {Object.entries(UserGuideIndex).map(([heading, subtopics]) => (
        <UserGuideSidebarSection
          key={heading}
          title={heading}
          subTopics={subtopics}
        />
      ))}
    </StyledContainer>
  );
};

export default UserGuideSidebar;
