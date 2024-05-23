'use client';

import styled from '@emotion/styled';
import {
  IconBook,
  IconCode,
  IconGitPullRequest,
  IconTool,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

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

const DocsSidebar = ({
  userGuideIndex,
}: {
  userGuideIndex: UserGuideArticlesProps[];
}) => {
  const router = useRouter();
  const sections = [
    { name: 'Getting Started' },
    { name: 'Contributing' },
    { name: 'Extending' },
    { name: 'User Guide' },
  ];
  const iconSize = Theme.icon.size.md;

  return (
    <StyledContainer>
      {sections.map((section) => (
        <>
          <StyledHeading>
            <StyledIconContainer>
              {section.name.includes('Started') ? (
                <IconCode size={iconSize} />
              ) : section.name.includes('Contributing') ? (
                <IconGitPullRequest size={iconSize} />
              ) : section.name.includes('Extending') ? (
                <IconTool size={iconSize} />
              ) : (
                <IconBook size={iconSize} />
              )}
            </StyledIconContainer>
            <StyledHeadingText onClick={() => router.push('/docs')}>
              {section.name}
            </StyledHeadingText>
          </StyledHeading>
          <UserGuideSidebarSection userGuideIndex={userGuideIndex} />
        </>
      ))}
    </StyledContainer>
  );
};

export default DocsSidebar;
