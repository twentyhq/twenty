// Extracted verbatim from the old data (the notes table).
import { sharedAssetUrls } from './shared-asset-urls';
import { type TablePageDefinition } from '../types';

const PEOPLE_AVATAR_URLS = sharedAssetUrls.peopleAvatars;

export const NOTES_TABLE_PAGE: TablePageDefinition = {
  type: 'table',
  header: {
    title: 'All Notes',
    count: 2,
  },
  columns: [
    { id: 'title', label: 'Title', width: 240, isFirstColumn: true },
    { id: 'createdBy', label: 'Created By', width: 160 },
    { id: 'relatedTo', label: 'Related To', width: 160 },
    { id: 'added', label: 'Added', width: 180 },
  ],
  rows: [
    {
      id: 'discovery-call',
      cells: {
        title: {
          type: 'text',
          value: 'Discovery call notes',
          shortLabel: 'D',
          tone: 'green',
        },
        createdBy: {
          type: 'person',
          name: 'Ivan Zhao',
          tone: 'gray',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
        },
        relatedTo: {
          type: 'entity',
          name: 'Notion',
          domain: 'notion.com',
        },
        added: { type: 'text', value: 'Sep 2, 2023' },
      },
    },
    {
      id: 'design-system-meeting',
      cells: {
        title: {
          type: 'text',
          value: 'Design system meeting',
          shortLabel: 'D',
          tone: 'green',
        },
        createdBy: {
          type: 'person',
          name: 'Dylan Field',
          tone: 'purple',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.dylanField,
        },
        relatedTo: {
          type: 'entity',
          name: 'Figma',
          domain: 'figma.com',
        },
        added: { type: 'text', value: 'Oct 18, 2023' },
      },
    },
  ],
};
