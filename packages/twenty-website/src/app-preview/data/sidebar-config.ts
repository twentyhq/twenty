// The mockup's sidebar, ported from the old app-preview data.
import { COMPANIES_TABLE_PAGE } from './companies-table-page';
import { SALES_DASHBOARD_PAGE } from './sales-dashboard-page';
import { WORKFLOWS_FOLDER } from './workflows-folder';
import { DASHBOARDS_TABLE_PAGE } from './dashboards-table-page';
import { NOTES_TABLE_PAGE } from './notes-table-page';
import { OPPORTUNITY_KANBAN_PAGE } from './opportunity-kanban-page';
import { PEOPLE_TABLE_PAGE } from './people-table-page';
import { TASKS_TABLE_PAGE } from './tasks-table-page';
import { type AppPreviewConfig } from '../types';

export const APP_PREVIEW_CONFIG: AppPreviewConfig = {
  defaultViewbarActions: ['Filter', 'Sort', 'Options'],
  sidebar: {
    favorites: [
      {
        id: 'sales-dashboard',
        label: 'Sales Dashboard',
        icon: { kind: 'avatar', label: 'S', tone: 'amber', shape: 'circle' },
        meta: 'Dashboard',
        page: SALES_DASHBOARD_PAGE,
      },
    ],
    initialActiveItemId: 'companies',
    initialOpenFolderIds: [],
    workspace: [
      {
        id: 'companies',
        label: 'Companies',
        icon: { kind: 'tabler', name: 'buildingSkyscraper', tone: 'blue' },
        page: COMPANIES_TABLE_PAGE,
      },
      {
        id: 'people',
        label: 'People',
        icon: { kind: 'tabler', name: 'user', tone: 'blue' },
        page: PEOPLE_TABLE_PAGE,
      },
      {
        id: 'opportunities',
        label: 'Opportunities',
        icon: { kind: 'tabler', name: 'targetArrow', tone: 'red' },
        page: OPPORTUNITY_KANBAN_PAGE,
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: { kind: 'tabler', name: 'checkbox', tone: 'teal' },
        page: TASKS_TABLE_PAGE,
      },
      {
        id: 'notes',
        label: 'Notes',
        icon: { kind: 'tabler', name: 'notes', tone: 'teal' },
        page: NOTES_TABLE_PAGE,
      },
      {
        id: 'dashboards',
        label: 'Dashboards',
        icon: { kind: 'tabler', name: 'layoutDashboard', tone: 'gray' },
        page: DASHBOARDS_TABLE_PAGE,
      },
      WORKFLOWS_FOLDER,
      {
        id: 'book-demo',
        label: 'Book a demo',
        href: 'https://cal.com/forms/f7841033-0a20-4958-8c92-4e34ec128a81',
        icon: { kind: 'brand', brand: 'twenty', overlay: 'link' },
      },
    ],
  },
};
