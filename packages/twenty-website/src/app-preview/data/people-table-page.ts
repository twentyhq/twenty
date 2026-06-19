// Extracted verbatim from the old data (the people table).
import { sharedAssetUrls } from './shared-asset-urls';
import { type TablePageDefinition } from '../types';

const PEOPLE_AVATAR_URLS = sharedAssetUrls.peopleAvatars;

export const PEOPLE_TABLE_PAGE: TablePageDefinition = {
  type: 'table',
  header: {
    title: 'All People',
    count: 5,
  },
  columns: [
    { id: 'name', label: 'Name', width: 180, isFirstColumn: true },
    { id: 'company', label: 'Company', width: 160 },
    { id: 'email', label: 'Email', width: 200 },
    { id: 'phone', label: 'Phone', width: 160 },
    { id: 'jobTitle', label: 'Job Title', width: 160 },
    { id: 'city', label: 'City', width: 120 },
    { id: 'linkedin', label: 'Linkedin', width: 140 },
    { id: 'added', label: 'Added', width: 160 },
  ],
  rows: [
    {
      id: 'dario-amodei',
      cells: {
        name: {
          type: 'person',
          name: 'Dario Amodei',
          tone: 'gray',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.darioAmodei,
        },
        company: {
          type: 'entity',
          name: 'Anthropic',
          domain: 'anthropic.com',
        },
        email: {
          type: 'link',
          kind: 'email',
          value: 'dario@anthropic.com',
        },
        phone: {
          type: 'link',
          kind: 'phone',
          value: '+1 415 555 0101',
        },
        jobTitle: { type: 'text', value: 'CEO' },
        city: { type: 'text', value: 'San Francisco' },
        linkedin: {
          type: 'link',
          kind: 'social',
          value: 'dario-amodei',
        },
        added: { type: 'text', value: 'Jul 3, 2023' },
      },
    },
    {
      id: 'ryan-roslansky',
      cells: {
        name: {
          type: 'person',
          name: 'Ryan Roslansky',
          tone: 'teal',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.ryanRoslansky,
        },
        company: {
          type: 'entity',
          name: 'Linkedin',
          domain: 'linkedin.com',
        },
        email: {
          type: 'link',
          kind: 'email',
          value: 'ryan@linkedin.com',
        },
        phone: {
          type: 'link',
          kind: 'phone',
          value: '+1 650 555 0134',
        },
        jobTitle: { type: 'text', value: 'CEO' },
        city: { type: 'text', value: 'Sunnyvale' },
        linkedin: {
          type: 'link',
          kind: 'social',
          value: 'ryanroslansky',
        },
        added: { type: 'text', value: 'Jul 28, 2023' },
      },
    },
    {
      id: 'stewart-butterfield',
      cells: {
        name: {
          type: 'person',
          name: 'Stewart Butterfield',
          tone: 'teal',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.stewartButterfield,
        },
        company: {
          type: 'entity',
          name: 'Slack',
          domain: 'slack.com',
        },
        email: {
          type: 'link',
          kind: 'email',
          value: 'stewart@slack.com',
        },
        phone: {
          type: 'link',
          kind: 'phone',
          value: '+1 415 555 0142',
        },
        jobTitle: { type: 'text', value: 'Co-founder' },
        city: { type: 'text', value: 'San Francisco' },
        linkedin: {
          type: 'link',
          kind: 'social',
          value: 'stewart-butterfield',
        },
        added: { type: 'text', value: 'Jul 18, 2023' },
      },
    },
    {
      id: 'ivan-zhao',
      cells: {
        name: {
          type: 'person',
          name: 'Ivan Zhao',
          tone: 'gray',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
        },
        company: {
          type: 'entity',
          name: 'Notion',
          domain: 'notion.com',
        },
        email: {
          type: 'link',
          kind: 'email',
          value: 'ivan@notion.com',
        },
        phone: {
          type: 'link',
          kind: 'phone',
          value: '+1 628 555 0186',
        },
        jobTitle: { type: 'text', value: 'CEO' },
        city: { type: 'text', value: 'San Francisco' },
        linkedin: {
          type: 'link',
          kind: 'social',
          value: 'ivanhzhao',
        },
        added: { type: 'text', value: 'Jul 8, 2023' },
      },
    },
    {
      id: 'dylan-field',
      cells: {
        name: {
          type: 'person',
          name: 'Dylan Field',
          tone: 'purple',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.dylanField,
        },
        company: {
          type: 'entity',
          name: 'Figma',
          domain: 'figma.com',
        },
        email: {
          type: 'link',
          kind: 'email',
          value: 'dylan@figma.com',
        },
        phone: {
          type: 'link',
          kind: 'phone',
          value: '+1 415 555 0128',
        },
        jobTitle: { type: 'text', value: 'CEO' },
        city: { type: 'text', value: 'San Francisco' },
        linkedin: {
          type: 'link',
          kind: 'social',
          value: 'dylanfield',
        },
        added: { type: 'text', value: 'Jul 12, 2023' },
      },
    },
  ],
};
