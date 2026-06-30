// Extracted verbatim from the old data (the dashboards table).
import { sharedAssetUrls } from './shared-asset-urls';
import { type TablePageDefinition } from '../types';

const PEOPLE_AVATAR_URLS = sharedAssetUrls.peopleAvatars;

export const DASHBOARDS_TABLE_PAGE: TablePageDefinition = {
  type: 'table',
  header: {
    title: 'All Dashboards',
    count: 2,
  },
  columns: [
    { id: 'name', label: 'Name', width: 240, isFirstColumn: true },
    { id: 'createdBy', label: 'Created By', width: 160 },
    { id: 'added', label: 'Last Edited', width: 160 },
  ],
  rows: [
    {
      id: 'sales-dashboard',
      cells: {
        name: {
          type: 'text',
          value: 'Sales Dashboard',
          shortLabel: 'S',
          tone: 'amber',
        },
        createdBy: {
          type: 'person',
          name: 'Dario Amodei',
          tone: 'gray',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
        },
        added: { type: 'text', value: 'Oct 24, 2023' },
      },
    },
    {
      id: 'pipeline-health',
      cells: {
        name: {
          type: 'text',
          value: 'Pipeline Health',
          shortLabel: 'P',
          tone: 'blue',
        },
        createdBy: {
          type: 'person',
          name: 'Patrick Collison',
          tone: 'blue',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.patrickCollison,
        },
        added: { type: 'text', value: 'Oct 19, 2023' },
      },
    },
  ],
};
