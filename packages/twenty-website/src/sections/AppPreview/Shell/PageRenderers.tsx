'use client';

import { styled } from '@linaria/react';
import dynamic from 'next/dynamic';

import type { PageDefinition } from '../types';
import { KanbanPage } from '../Pages/Kanban/KanbanPage';
import { RecordPage } from '../Pages/Record/RecordPage';
import { TablePage } from '../Pages/Table/TablePage';
import { WorkflowPage } from '../Pages/Workflow/WorkflowPage';
import { PagePreviewLoader } from '../Shared/components/PagePreviewLoader';

const DashboardViewport = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  scrollbar-width: none;
  width: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const loadSalesDashboardPageModule = () =>
  import('../Pages/Dashboard/SalesDashboardPage');

const SalesDashboardPage = dynamic(
  () =>
    loadSalesDashboardPageModule().then((mod) => ({
      default: mod.SalesDashboardPage,
    })),
  {
    loading: () => (
      <PagePreviewLoader ariaLabel="Loading sales dashboard preview" />
    ),
    ssr: false,
  },
);

export function renderPageDefinition(
  page: PageDefinition,
  onNavigateToPageItemId?: (itemId: string) => void,
) {
  switch (page.type) {
    case 'table':
      return (
        <TablePage
          page={page}
          onNavigateToPageItemId={onNavigateToPageItemId}
        />
      );
    case 'kanban':
      return <KanbanPage page={page} />;
    case 'dashboard':
      return (
        <DashboardViewport
          aria-label={`Interactive preview of the ${page.header.title.toLowerCase()}`}
        >
          <SalesDashboardPage page={page} />
        </DashboardViewport>
      );
    case 'record':
      return <RecordPage page={page} />;
    case 'workflow':
      return <WorkflowPage page={page} />;
  }
}
