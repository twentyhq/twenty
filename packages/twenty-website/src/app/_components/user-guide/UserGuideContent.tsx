'use client';
import React from 'react';
import styled from '@emotion/styled';

import { ArticleContent } from '@/app/_components/ui/layout/articles/ArticleContent';
import { Breadcrumbs } from '@/app/_components/ui/layout/Breadcrumbs';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import { FileContent } from '@/app/_server-utils/get-posts';

const StyledContainer = styled('div')`
  ${mq({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottom: `1px solid ${Theme.background.transparent.medium}`,
    fontFamily: `${Theme.font.family}`,
  })};
  width: 100%;
  min-height: calc(100vh - 50px);

  @media (min-width: 990px) {
    justify-content: flex-start;
  }
`;

const StyledWrapper = styled.div`
  @media (max-width: 450px) {
    padding: ${Theme.spacing(10)} 30px ${Theme.spacing(20)};
  }

  @media (min-width: 451px) and (max-width: 800px) {
    padding: ${Theme.spacing(10)} 50px ${Theme.spacing(20)};
    width: 440px;
  }

  @media (min-width: 801px) {
    max-width: 720px;
    margin: ${Theme.spacing(10)} 92px ${Theme.spacing(20)};
  }

  @media (min-width: 1500px) {
    max-width: 720px;
    margin: ${Theme.spacing(10)} auto ${Theme.spacing(20)};
  }
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(8)};
  @media (min-width: 450px) and (max-width: 800px) {
    width: 340px;
  }
`;

const StyledHeading = styled.h1`
  font-size: 40px;
  font-weight: 700;
  font-family: var(--font-gabarito);
  margin: 0px;
  @media (max-width: 800px) {
    font-size: 28px;
  }
`;

const StyledHeaderInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(1)};
`;

const StyledHeaderInfoSectionTitle = styled.div`
  font-size: ${Theme.font.size.sm};
  padding: ${Theme.spacing(2)} 0px;
  color: ${Theme.text.color.secondary};
  font-weight: ${Theme.font.weight.medium};
  font-family: var(--font-gabarito);
`;

const StyledHeaderInfoSectionSub = styled.p`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(4)};
  color: ${Theme.text.color.tertiary};
  line-height: 1.8;
  margin: 0px;
`;

const StyledRectangle = styled.div`
  width: 100%;
  height: 1px;
  background: ${Theme.background.transparent.medium};
`;

const StyledImageContainer = styled.div`
  border: 2px solid ${Theme.text.color.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 16px;
  max-width: fit-content;

  img {
    height: 100%;
    max-width: 100%;
    width: 100%;
    @media (min-width: 1000px) {
      width: 720px;
    }
  }
`;

export default function UserGuideContent({ item }: { item: FileContent }) {
  const BREADCRUMB_ITEMS = [
    {
      uri: '/user-guide',
      label: 'User Guide',
    },
  ];

  return (
    <StyledContainer>
      <StyledWrapper>
        <StyledHeader>
          <Breadcrumbs
            items={BREADCRUMB_ITEMS}
            activePage={item.itemInfo.title}
            separator="/"
          />
          <StyledHeading>{item.itemInfo.title}</StyledHeading>
          <StyledImageContainer>
            {item.itemInfo.image && (
              <img
                id={`img-${item.itemInfo.title}`}
                src={item.itemInfo.image}
                alt={item.itemInfo.title}
              />
            )}
          </StyledImageContainer>
          <StyledHeaderInfoSection>
            <StyledHeaderInfoSectionTitle>
              In this article
            </StyledHeaderInfoSectionTitle>
            <StyledHeaderInfoSectionSub>
              {item.itemInfo.info}
            </StyledHeaderInfoSectionSub>
          </StyledHeaderInfoSection>
          <StyledRectangle />
        </StyledHeader>
        <ArticleContent>{item.content}</ArticleContent>
      </StyledWrapper>
    </StyledContainer>
  );
}
