'use client';

import dynamic from 'next/dynamic';

import { KanbanPage } from './kanban/KanbanPage';
import { RecordPage } from './record/RecordPage';
import { TablePage } from './table/TablePage';
import { WorkflowPage } from './workflow/WorkflowPage';
import { type PageDefinition } from '../types';

// The dashboard (charts) is the heaviest page and never the landing view:
// it stays a deferred chunk, idle-preloaded by its hosts after mount.
const DashboardPage = dynamic(
  () =>
    import('./dashboard/DashboardPage').then((module) => module.DashboardPage),
  { ssr: false },
);

export function renderPage(page: PageDefinition) {
  switch (page.type) {
    case 'table':
      return <TablePage page={page} />;
    case 'kanban':
      return <KanbanPage page={page} />;
    case 'workflow':
      return <WorkflowPage page={page} />;
    case 'dashboard':
      return <DashboardPage page={page} />;
    case 'record':
      return <RecordPage page={page} />;
    default:
      return null;
  }
}
