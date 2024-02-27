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
`;

const StyledHeaderInfoSectionSub = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(4)};
  color: ${Theme.text.color.tertiary};
  font-family: ${Theme.font.family};
`;

const StyledRectangle = styled.div`
  width: 100%;
  height: 1px;
  background: ${Theme.background.transparent.medium};
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
          {item.itemInfo.image && (
            <img
              id={`img-${item.itemInfo.title}`}
              src={item.itemInfo.image}
              alt={item.itemInfo.title}
            />
          )}
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
        <div>{item.content}</div>
      </StyledWrapper>
    </StyledContainer>
  );
}
