// Extracted verbatim from the old data (the tasks table).
import { sharedAssetUrls } from './shared-asset-urls';
import { type TablePageDefinition } from '../types';

const PEOPLE_AVATAR_URLS = sharedAssetUrls.peopleAvatars;

export const TASKS_TABLE_PAGE: TablePageDefinition = {
  type: 'table',
  header: {
    title: 'All Tasks',
    count: 2,
  },
  columns: [
    { id: 'title', label: 'Title', width: 220, isFirstColumn: true },
    { id: 'assignee', label: 'Assignee', width: 160 },
    { id: 'dueDate', label: 'Due Date', width: 160 },
    { id: 'relatedTo', label: 'Related To', width: 160 },
    { id: 'status', label: 'Status', width: 140 },
  ],
  rows: [
    {
      id: 'send-nda',
      cells: {
        title: {
          type: 'text',
          value: 'Send NDA',
          shortLabel: 'S',
          tone: 'teal',
        },
        assignee: {
          type: 'person',
          name: 'Dario Amodei',
          tone: 'gray',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
        },
        dueDate: { type: 'text', value: 'Oct 25, 2023' },
        relatedTo: {
          type: 'entity',
          name: 'Anthropic',
          domain: 'anthropic.com',
        },
        status: { type: 'select', value: 'To Do' },
      },
    },
    {
      id: 'review-proposal',
      cells: {
        title: {
          type: 'text',
          value: 'Review proposal',
          shortLabel: 'R',
          tone: 'teal',
        },
        assignee: {
          type: 'person',
          name: 'Stewart Butterfield',
          tone: 'teal',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.stewartButterfield,
        },
        dueDate: { type: 'text', value: 'Oct 28, 2023' },
        relatedTo: {
          type: 'entity',
          name: 'Slack',
          domain: 'slack.com',
        },
        status: {
          type: 'select',
          color: 'blue',
          value: 'In Progress',
        },
      },
    },
  ],
};
