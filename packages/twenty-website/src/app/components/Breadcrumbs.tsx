import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';

const Container = styled.div`
  display: flex;
  gap: 8px;
  color: #b3b3b3;
`;

const InternalLinkItem = styled(Link)`
  text-decoration: none;
  color: #b3b3b3;
`;

const ExternalLinkItem = styled.a`
  text-decoration: none;
  color: #b3b3b3;
`;

const ActivePage = styled.span`
  color: #818181;
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
  return (
    <Container>
      {items.map((item, index) => (
        <React.Fragment key={`${item?.uri ?? 'item'}-${index}`}>
          {item.isExternal ? (
            <ExternalLinkItem href={item.uri}>{item.label}</ExternalLinkItem>
          ) : (
            <InternalLinkItem href={item.uri}>{item.label}</InternalLinkItem>
          )}
          <span>{separator}</span>
        </React.Fragment>
      ))}
      <ActivePage>{activePage}</ActivePage>
    </Container>
  );
};
