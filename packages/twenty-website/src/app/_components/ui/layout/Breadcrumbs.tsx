'use client';

import React from 'react';
import styled from '@emotion/styled';
import { IconChevronLeft } from '@tabler/icons-react';
import Link from 'next/link';

import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';

const Container = styled.div`
  ${mq({
    display: ['none', 'flex', 'flex'],
    gap: `${Theme.spacing(2)}`,
    color: '#b3b3b3',
  })};
`;

const InternalLinkItem = styled(Link)`
  text-decoration: none;
  color: #b3b3b3;
  &:hover {
    color: ${Theme.text.color.quarternary};
    text-decoration: underline;
  }
  font-family: var(--font-gabarito);
`;

const ExternalLinkItem = styled.a`
  text-decoration: none;
  color: #b3b3b3;
`;

const ActivePage = styled.span`
  color: ${Theme.text.color.primary};
  font-weight: ${Theme.font.weight.medium};
  font-family: var(--font-gabarito);
`;

const StyledSection = styled.div`
  font-size: ${Theme.font.size.sm};
  font-weight: ${Theme.font.weight.medium};
  color: ${Theme.text.color.quarternary};
  display: flex;
  flex-direction: row;
  gap: ${Theme.spacing(2)};
`;

const StyledMobileContainer = styled.div`
  ${mq({
    display: ['flex', 'none', 'none'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: `${Theme.spacing(1)}`,
    color: `${Theme.text.color.quarternary}`,
    fontSize: `${Theme.font.size.sm}`,
  })};
`;

interface BreadcrumbsProps {
  items: {
    uri: string;
    label: string;
    isExternal?: boolean;
  }[];
  activePage: string;
  separator: string;
  style?: boolean;
}

export const Breadcrumbs = ({
  items,
  activePage,
  separator,
}: BreadcrumbsProps) => {
  const lastItem = items[items.length - 1];

  return (
    <div>
      <StyledMobileContainer>
        <IconChevronLeft size={Theme.icon.size.md} />
        <InternalLinkItem href={lastItem.uri}>
          {lastItem.label}
        </InternalLinkItem>
      </StyledMobileContainer>
      <Container>
        {items.map((item, index) => (
          <StyledSection key={`${item?.uri ?? 'item'}-${index}`}>
            {item.isExternal ? (
              <ExternalLinkItem href={item.uri}>{item.label}</ExternalLinkItem>
            ) : (
              <InternalLinkItem href={item.uri}>{item.label}</InternalLinkItem>
            )}
            <div>{separator}</div>
          </StyledSection>
        ))}
        <ActivePage>{activePage}</ActivePage>
      </Container>
    </div>
  );
};
