'use client';

import styled from '@emotion/styled';
import {
  IconBook,
  IconCode,
  IconComponents,
  IconGitPullRequest,
  IconTool,
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

import { AlgoliaDocSearch } from '@/app/_components/docs/AlgoliaDocSearch';
import DocsSidebarSection from '@/app/_components/docs/DocsSidebarSection';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import { DocsArticlesProps } from '@/content/user-guide/constants/getDocsArticles';

import '@docsearch/css';
import '../../user-guide/algolia.css';

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

const StyledHeadingText = styled.h1`
  cursor: pointer;
  font-size: ${Theme.font.size.sm};
  font-weight: ${Theme.font.weight.medium};
  color: ${Theme.text.color.secondary};
`;

const DocsSidebar = ({ docsIndex }: { docsIndex: DocsArticlesProps[] }) => {
  const router = useRouter();
  const pathName = usePathname();
  const path = pathName.includes('user-guide') ? '/user-guide' : '/docs';
  const iconSize = Theme.icon.size.md;

  const sections = Array.from(
    new Set(docsIndex.map((guide) => guide.section)),
  ).map((section) => ({
    name: section,
    icon: section.includes('Started') ? (
      <IconCode size={iconSize} />
    ) : section.includes('Contributing') ? (
      <IconGitPullRequest size={iconSize} />
    ) : section.includes('Extending') ? (
      <IconTool size={iconSize} />
    ) : section.includes('Components') ? (
      <IconComponents size={iconSize} />
    ) : (
      <IconBook size={iconSize} />
    ),
    guides: docsIndex.filter(
      (guide) =>
        guide.section === section &&
        !(guide.numberOfFiles > 1 && guide.topic === guide.title),
    ),
  }));

  return (
    <StyledContainer>
      <AlgoliaDocSearch />
      {sections.map((section) => (
        <div key={section.name}>
          <StyledHeading>
            <StyledIconContainer>{section.icon}</StyledIconContainer>
            <StyledHeadingText
              onClick={() =>
                router.push(
                  section.name === 'User Guide' ? '/user-guide' : path,
                )
              }
            >
              {section.name}
            </StyledHeadingText>
          </StyledHeading>
          <DocsSidebarSection docsIndex={section.guides} />
        </div>
      ))}
    </StyledContainer>
  );
};

export default DocsSidebar;
