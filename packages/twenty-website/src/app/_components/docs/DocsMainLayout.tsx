'use client';
import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { usePathname } from 'next/navigation';

import DocsSidebar from '@/app/_components/docs/DocsSideBar';
import DocsTableContents from '@/app/_components/docs/TableContent';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import { DocsArticlesProps } from '@/content/user-guide/constants/getDocsArticles';
import {
  isPlaygroundPage,
  shouldShowEmptySidebar,
} from '@/shared-utils/pathUtils';

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

  return (
    <StyledContainer>
      {!isPlaygroundPage(pathname) && <DocsSidebar docsIndex={docsIndex} />}
      {children}
      {shouldShowEmptySidebar(pathname) ? (
        <StyledEmptySideBar />
      ) : (
        <DocsTableContents />
      )}
    </StyledContainer>
  );
};
