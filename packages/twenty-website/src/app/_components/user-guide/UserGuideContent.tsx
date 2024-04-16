'use client';
import React from 'react';
import styled from '@emotion/styled';

import { Breadcrumbs } from '@/app/_components/ui/layout/Breadcrumbs';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import { FileContent } from '@/app/_server-utils/get-posts';

const StyledContainer = styled('div')`
  ${mq({
    width: ['100%', '70%', '60%'],
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottom: `1px solid ${Theme.background.transparent.medium}`,
    fontFamily: `${Theme.font.family}`,
  })};
`;

const StyledWrapper = styled.div`
  width: 79.3%;
  padding: ${Theme.spacing(10)} 0px ${Theme.spacing(20)} 0px;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(8)};
`;

const StyledHeading = styled.div`
  font-size: 40px;
  font-weight: 700;
  font-family: var(--font-gabarito);
`;

const StyledHeaderInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(4)};
`;

const StyledHeaderInfoSectionTitle = styled.div`
  font-size: ${Theme.font.size.sm};
  padding: ${Theme.spacing(2)} 0px;
  color: ${Theme.text.color.secondary};
  font-weight: ${Theme.font.weight.medium};
  font-family: var(--font-gabarito);
`;

const StyledHeaderInfoSectionSub = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(4)};
  color: ${Theme.text.color.tertiary};
  line-height: 28.8px;
`;

const StyledRectangle = styled.div`
  width: 100%;
  height: 1px;
  background: ${Theme.background.transparent.medium};
`;

const StyledContent = styled.div`
  h1 {
    margin-top: 64px;
    font-family: var(--font-gabarito);
  }

  h2 {
    margin: 64px 0px 32px;
    font-family: var(--font-gabarito);
  }

  p {
    margin: 32px 0px;
    color: ${Theme.text.color.secondary};
    font-family: ${Theme.font.family};
    line-height: 28.8px;
  }

  li {
    margin: 32px 0px;
    line-height: 28.8px;
    font-family: ${Theme.font.family};
    color: ${Theme.text.color.secondary};
  }

  @media (min-width: 2200px) {
    max-width: 1050px;
  }
`;

const StyledImageContainer = styled.div`
  border: 2px solid ${Theme.text.color.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 16px;
  height: 340px;
  max-width: 1050px;
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
        <StyledContent>{item.content}</StyledContent>
      </StyledWrapper>
    </StyledContainer>
  );
}
