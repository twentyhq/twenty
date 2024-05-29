'use client';
import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { usePathname } from 'next/navigation';

import DocsSidebar from '@/app/_components/docs/DocsSideBar';
import DocsTableContents from '@/app/_components/docs/TableContent';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import { DocsArticlesProps } from '@/content/user-guide/constants/getDocsArticles';

const StyledContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid ${Theme.background.transparent.medium};
  min-height: calc(100vh - 50px);
`;

const StyledEmptySideBar = styled.div`
  ${mq({
    width: '20%',
    display: ['none', 'none', ''],
  })};
`;

export const DocsMainLayout = ({
  children,
  docsIndex,
}: {
  children: ReactNode;
  docsIndex: DocsArticlesProps[];
}) => {
  const pathname = usePathname();
  const isPathnameSection =
    pathname?.startsWith('/docs/section') ||
    pathname?.startsWith('/user-guide/section');
  const isDocsSection = isPathnameSection && pathname?.split('/').length === 4;

  const isPlaygroundPage =
    pathname?.startsWith('/docs/rest-api') ||
    pathname?.startsWith('/docs/graphql-api');

  return (
    <StyledContainer>
      {!isPlaygroundPage && <DocsSidebar docsIndex={docsIndex} />}

      {children}
      {pathname === '/user-guide' ||
      pathname === '/docs' ||
      isDocsSection ||
      isPlaygroundPage ? (
        <StyledEmptySideBar />
      ) : (
        <DocsTableContents />
      )}
    </StyledContainer>
  );
};
