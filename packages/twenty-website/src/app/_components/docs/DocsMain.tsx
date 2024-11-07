'use client';
import styled from '@emotion/styled';
import { usePathname } from 'next/navigation';

import DocsCard from '@/app/_components/docs/DocsCard';
import { Breadcrumbs } from '@/app/_components/ui/layout/Breadcrumbs';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import { DocsArticlesProps } from '@/content/user-guide/constants/getDocsArticles';
import { constructSections } from '@/shared-utils/constructSections';
import { filterDocsIndex } from '@/shared-utils/filterDocsIndex';
import { getUriAndLabel } from '@/shared-utils/pathUtils';

const StyledContainer = styled.div`
  ${mq({
    width: ['100%', '60%', '60%'],
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  })};
  @media (min-width: 1500px) {
    width: 100%;
  }
`;

const StyledWrapper = styled.div`
  padding: ${Theme.spacing(10)} 92px ${Theme.spacing(20)};
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (max-width: 450px) {
    padding: ${Theme.spacing(10)} 32px ${Theme.spacing(20)};
    align-items: flex-start;
  }

  @media (min-width: 450px) and (max-width: 800px) {
    padding: ${Theme.spacing(10)} 50px ${Theme.spacing(20)};
    align-items: flex-start;
    width: 440px;
  }

  @media (min-width: 1500px) {
    width: 720px;
    padding: ${Theme.spacing(10)} 0px ${Theme.spacing(20)};
    margin-right: 300px;
  }
`;

const StyledTitle = styled.div`
  font-size: ${Theme.font.size.sm};
  color: ${Theme.text.color.quarternary};
  font-weight: ${Theme.font.weight.medium};
  width: 100%;

  @media (min-width: 450px) and (max-width: 800px) {
    width: 340px;
    display: flex;
    align-items: center;
  }
`;

const StyledSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (min-width: 801px) {
    align-items: flex-start;
  }
  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  width: 100%;
  @media (min-width: 450px) and (max-width: 1200px) {
    width: 340px;
    margin-bottom: 24px;
  }
  @media (min-width: 450px) and (max-width: 800px) {
    margin-bottom: 24px;
    width: 340px;
  }
`;

const StyledHeading = styled.h1`
  line-height: 38px;
  font-weight: 700;
  font-size: 40px;
  color: ${Theme.text.color.primary};
  margin: 0px;
  margin-top: 32px;
  @media (max-width: 800px) {
    font-size: 28px;
  }
`;

const StyledSubHeading = styled.h1`
  line-height: 28.8px;
  font-size: ${Theme.font.size.lg};
  font-weight: ${Theme.font.weight.regular};
  color: ${Theme.text.color.tertiary};
  @media (max-width: 800px) {
    font-size: ${Theme.font.size.sm};
  }
`;

const StyledContent = styled.div`
  ${mq({
    width: '100%',
    paddingTop: `${Theme.spacing(6)}`,
    display: ['flex', 'flex', 'grid'],
    flexDirection: 'column',
    gridTemplateRows: 'auto auto',
    gridTemplateColumns: 'auto auto',
    gap: `${Theme.spacing(6)}`,
  })};
  @media (min-width: 450px) {
    justify-content: flex-start;
    width: 340px;
  }
`;

interface DocsProps {
  docsArticleCards: DocsArticlesProps[];
  isSection?: boolean;
}

export default function DocsMain({
  docsArticleCards,
  isSection = false,
}: DocsProps) {
  const sections = constructSections(docsArticleCards, isSection);
  const pathname = usePathname();
  const { uri, label } = getUriAndLabel(pathname);

  const BREADCRUMB_ITEMS = [
    {
      uri: uri,
      label: label,
    },
  ];

  return (
    <StyledContainer>
      <StyledWrapper>
        {isSection ? (
          <Breadcrumbs
            items={BREADCRUMB_ITEMS}
            activePage={sections[0].name}
            separator="/"
          />
        ) : (
          <StyledTitle>{label}</StyledTitle>
        )}
        {sections.map((section, index) => {
          const filteredArticles = isSection
            ? docsArticleCards
            : filterDocsIndex(docsArticleCards, section.name);
          return (
            <StyledSection key={index}>
              <StyledHeader>
                <StyledHeading>{section.name}</StyledHeading>
                <StyledSubHeading>{section.info}</StyledSubHeading>
              </StyledHeader>
              <StyledContent>
                {filteredArticles.map((card) => (
                  <DocsCard
                    key={card.title}
                    card={card}
                    isSection={isSection}
                  />
                ))}
              </StyledContent>
            </StyledSection>
          );
        })}
      </StyledWrapper>
    </StyledContainer>
  );
}
