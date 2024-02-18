'use client';

import React from 'react';
import styled from '@emotion/styled';
import { IconChevronLeft } from '@tabler/icons-react';
import Link from 'next/link';

import { Theme } from '@/app/ui/theme/theme';
import { DeviceType, useDeviceType } from '@/app/ui/utilities/useDeviceType';

const Container = styled.div`
  display: flex;
  gap: 8px;
  color: #b3b3b3;
`;

const InternalLinkItem = styled(Link)`
  text-decoration: none;
  color: #b3b3b3;
  &:hover {
    color: ${Theme.text.color.quarternary};
  }
`;

const ExternalLinkItem = styled.a`
  text-decoration: none;
  color: #b3b3b3;
`;

const ActivePage = styled.span`
  color: ${Theme.text.color.secondary};
  font-weight: ${Theme.font.weight.medium};
`;

const StyledSection = styled(React.Fragment)`
  font-size: ${Theme.font.size.sm};
  font-weight: ${Theme.font.weight.medium};
  color: ${Theme.text.color.quarternary};
`;

const StyledMobileContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${Theme.spacing(1)};
  color: ${Theme.text.color.quarternary};
  font-size: ${Theme.font.size.sm};
`;

interface BreadcrumbsProps {
  items: {
    uri: string;
    label: string;
    isExternal?: boolean;
  }[];
  activePage: string;
  separator: string;
}

export const Breadcrumbs = ({
  items,
  activePage,
  separator,
}: BreadcrumbsProps) => {
  const isMobile = useDeviceType() === DeviceType.MOBILE;
  if (isMobile) {
    const lastItem = items[items.length - 1];
    return (
      <StyledMobileContainer>
        <IconChevronLeft size={Theme.icon.size.md} />
        <InternalLinkItem href={lastItem.uri}>
          {lastItem.label}
        </InternalLinkItem>
      </StyledMobileContainer>
    );
  }
  return (
    <Container>
      {items.map((item, index) => (
        <StyledSection key={`${item?.uri ?? 'item'}-${index}`}>
          {item.isExternal ? (
            <ExternalLinkItem href={item.uri}>{item.label}</ExternalLinkItem>
          ) : (
            <InternalLinkItem href={item.uri}>{item.label}</InternalLinkItem>
          )}
          <span>{separator}</span>
        </StyledSection>
      ))}
      <ActivePage>{activePage}</ActivePage>
    </Container>
  );
};
