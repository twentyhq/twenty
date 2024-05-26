'use client';

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';

import { IconBook } from '@/app/_components/ui/icons';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import UserGuideSidebarSection from '@/app/_components/user-guide/UserGuideSidebarSection';
import { UserGuideArticlesProps } from '@/content/user-guide/constants/getUserGuideArticles';

const StyledContainer = styled.div`
  ${mq({
    display: ['none', 'flex', 'flex'],
    flexDirection: 'column',
    background: `${Theme.background.secondary}`,
    borderRight: `1px solid ${Theme.background.transparent.medium}`,
    borderBottom: `1px solid ${Theme.background.transparent.medium}`,
    padding: `${Theme.spacing(10)} ${Theme.spacing(4)}`,
    gap: `${Theme.spacing(6)}`,
  })}
  width: 300px;
  min-width: 300px;
  overflow: scroll;
  height: calc(100vh - 60px);
  position: sticky;
  top: 64px;
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
  padding: ${Theme.spacing(1)};
`;

const StyledHeadingText = styled.div`
  cursor: pointer;
  font-size: ${Theme.font.size.sm};
  font-weight: ${Theme.font.weight.medium};
  color: ${Theme.text.color.secondary};
`;

const UserGuideSidebar = ({
  userGuideIndex,
}: {
  userGuideIndex: UserGuideArticlesProps[];
}) => {
  const router = useRouter();

  return (
    <StyledContainer>
      <StyledHeading>
        <StyledIconContainer>
          <IconBook size={Theme.icon.size.md} />
        </StyledIconContainer>
        <StyledHeadingText onClick={() => router.push('/user-guide')}>
          User Guide
        </StyledHeadingText>
      </StyledHeading>
      <UserGuideSidebarSection userGuideIndex={userGuideIndex} />
    </StyledContainer>
  );
};

export default UserGuideSidebar;
