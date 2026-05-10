'use client';

import { styled } from '@linaria/react';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import type {
  HeroDashboardPageDefinition,
  HeroKanbanPageDefinition,
  HeroPageDefinition,
  HeroPageType,
  HeroTablePageDefinition,
  HeroWorkflowPageDefinition,
} from '@/sections/Hero/types';
import { KanbanPage } from '../Pages/Kanban/KanbanPage';
import { TablePage } from '../Pages/Table/TablePage';
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

const loadWorkflowPageModule = () => import('../Pages/Workflow/WorkflowPage');

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

const WorkflowPage = dynamic(
  () =>
    loadWorkflowPageModule().then((mod) => ({
      default: mod.WorkflowPage,
    })),
  {
    loading: () => <PagePreviewLoader ariaLabel="Loading workflow preview" />,
    ssr: false,
  },
);

const PAGE_RENDERERS = {
  table: (page: HeroTablePageDefinition) => <TablePage page={page} />,
  kanban: (page: HeroKanbanPageDefinition) => <KanbanPage page={page} />,
  dashboard: (page: HeroDashboardPageDefinition) => (
    <DashboardViewport
      aria-label={`Interactive preview of the ${page.header.title.toLowerCase()}`}
    >
      <SalesDashboardPage page={page} />
    </DashboardViewport>
  ),
  workflow: (page: HeroWorkflowPageDefinition) => <WorkflowPage page={page} />,
} satisfies {
  [K in HeroPageType]: (
    page: Extract<HeroPageDefinition, { type: K }>,
  ) => ReactNode;
};

export function renderPageDefinition(
  page: HeroPageDefinition,
  onNavigateToLabel?: (label: string) => void,
  pageKey?: string,
) {
  switch (page.type) {
    case 'table':
      return (
        <TablePage
          key={pageKey}
          page={page}
          onNavigateToLabel={onNavigateToLabel}
        />
      );
    case 'kanban':
      return PAGE_RENDERERS.kanban(page);
    case 'dashboard':
      return PAGE_RENDERERS.dashboard(page);
    case 'workflow':
      return PAGE_RENDERERS.workflow(page);
  }
}
