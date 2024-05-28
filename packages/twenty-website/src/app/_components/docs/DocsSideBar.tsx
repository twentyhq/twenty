'use client';

import styled from '@emotion/styled';
import {
  IconBook,
  IconCode,
  IconGitPullRequest,
  IconTool,
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

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

const StyledHeadingText = styled.h2`
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
  const pathName = usePathname();
  const path = pathName.includes('user-guide') ? '/user-guide' : '/docs';
  const iconSize = Theme.icon.size.md;

  const sections = Array.from(
    new Set(userGuideIndex.map((guide) => guide.section)),
  ).map((section) => ({
    name: section,
    icon: section.includes('Started') ? (
      <IconCode size={iconSize} />
    ) : section.includes('Contributing') ? (
      <IconGitPullRequest size={iconSize} />
    ) : section.includes('Extending') ? (
      <IconTool size={iconSize} />
    ) : (
      <IconBook size={iconSize} />
    ),
    guides: userGuideIndex.filter(
      (guide) =>
        guide.section === section &&
        !(guide.numberOfFiles > 1 && guide.topic === guide.title),
    ),
  }));

  return (
    <StyledContainer>
      {sections.map((section) => (
        <div key={section.name}>
          <StyledHeading>
            <StyledIconContainer>{section.icon}</StyledIconContainer>
            <StyledHeadingText
              onClick={() =>
                router.push(
                  section.name === 'User Guide' ? '/user-guide' : '/docs',
                )
              }
            >
              {section.name}
            </StyledHeadingText>
          </StyledHeading>
          <UserGuideSidebarSection userGuideIndex={section.guides} />
        </div>
      ))}
    </StyledContainer>
  );
};

export default DocsSidebar;
