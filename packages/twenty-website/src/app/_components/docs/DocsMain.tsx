'use client';
import styled from '@emotion/styled';
import { usePathname } from 'next/navigation';

import { Breadcrumbs } from '@/app/_components/ui/layout/Breadcrumbs';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import UserGuideCard from '@/app/_components/user-guide/UserGuideCard';
import { UserGuideArticlesProps } from '@/content/user-guide/constants/getUserGuideArticles';

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
    padding: ${Theme.spacing(10)} 30px ${Theme.spacing(20)};
    align-items: center;
  }

  @media (min-width: 450px) and (max-width: 800px) {
    padding: ${Theme.spacing(10)} 50px ${Theme.spacing(20)};
    align-items: center;
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
  }
`;

const StyledSection = styled.div`
  &:not(:last-child) {
    margin-bottom: 100px;
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

interface UserGuideProps {
  userGuideArticleCards: UserGuideArticlesProps[];
  isSection?: boolean;
}

export default function DocsMain({
  userGuideArticleCards,
  isSection = false,
}: UserGuideProps) {
  const filterUserGuideIndex = (
    userGuideIndex: UserGuideArticlesProps[],
    sectionName: string,
  ): UserGuideArticlesProps[] => {
    return userGuideIndex.filter(
      (guide) =>
        guide.section.includes(sectionName) &&
        guide.title.includes(guide.topic),
    );
  };

  let sections;

  if (isSection) {
    sections = [
      {
        name: userGuideArticleCards[0].topic,
        info: userGuideArticleCards[0].info,
      },
    ];
  } else {
    sections = Array.from(
      new Map(
        userGuideArticleCards.map((guide) => [guide.section, guide]),
      ).values(),
    ).map((guide) => ({
      name: guide.section,
      info: guide.info,
    }));
  }
  const pathname = usePathname();
  const uri = pathname.includes('user-guide') ? '/user-guide' : '/docs';
  const label = pathname.includes('user-guide') ? 'User Guide' : 'Developers';
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
          <StyledTitle>Developers</StyledTitle>
        )}
        {sections.map((section) => {
          const filteredArticles = isSection
            ? userGuideArticleCards
            : filterUserGuideIndex(userGuideArticleCards, section.name);
          return (
            <StyledSection>
              <StyledHeader>
                <StyledHeading>{section.name}</StyledHeading>
                <StyledSubHeading>
                  A brief guide to grasp the basics of Twenty
                </StyledSubHeading>
              </StyledHeader>
              <StyledContent>
                {filteredArticles.map((card) => (
                  <UserGuideCard
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
