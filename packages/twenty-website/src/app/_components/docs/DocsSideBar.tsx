'use client';

import styled from '@emotion/styled';
import { usePathname, useRouter } from 'next/navigation';

import { AlgoliaDocSearch } from '@/app/_components/docs/AlgoliaDocSearch';
import DocsSidebarSection from '@/app/_components/docs/DocsSidebarSection';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import { DocsArticlesProps } from '@/content/user-guide/constants/getDocsArticles';
import { getSectionIcon } from '@/shared-utils/getSectionIcons';

import '@docsearch/css';
import '../../user-guide/algolia.css';

const StyledContainer = styled.div`
  ${mq({
    display: ['none', 'flex', 'flex'],
    flexDirection: 'column',
    background: `${Theme.background.secondary}`,
    borderRight: `1px solid ${Theme.background.transparent.medium}`,
    padding: `${Theme.spacing(10)} ${Theme.spacing(4)}`,
    gap: `${Theme.spacing(6)}`,
  })}
  width: 300px;
  min-width: 300px;
  overflow: scroll;
  overflow-x: hidden;
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
  margin-bottom: 8px;
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
  const path = pathName.includes('user-guide')
    ? '/user-guide'
    : pathName.includes('developers')
      ? '/developers'
      : '/twenty-ui';

  const sections = Array.from(
    new Set(docsIndex.map((guide) => guide.section)),
  ).map((section) => ({
    name: section,
    icon: getSectionIcon(section),
    guides: docsIndex.filter((guide) => {
      const isInSection = guide.section === section;
      const hasFiles = guide.numberOfFiles > 0;
      const isNotSingleFileTopic = !(
        guide.numberOfFiles > 1 && guide.topic === guide.title
      );

      return isInSection && hasFiles && isNotSingleFileTopic;
    }),
  }));

  return (
    <StyledContainer>
      <AlgoliaDocSearch pathname={pathName} />
      {sections.map((section) => (
        <div key={section.name}>
          <StyledHeading>
            <StyledIconContainer>{section.icon}</StyledIconContainer>
            <StyledHeadingText
              onClick={() =>
                router.push(
                  section.name === 'User Guide'
                    ? '/user-guide'
                    : section.name === 'Developers'
                      ? '/developers'
                      : path,
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
