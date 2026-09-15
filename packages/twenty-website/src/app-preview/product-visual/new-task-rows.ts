import { sharedAssetUrls } from '../data/shared-asset-urls';
import { type RowDef } from '../types';

const avatars = sharedAssetUrls.peopleAvatars;

// The 10 follow-up tasks the taskCreation scene "creates" while its
// answer streams in.
export const NEW_TASK_ROWS: RowDef[] = [
  {
    id: 'task-follow-up-anthropic',
    cells: {
      title: {
        type: 'text',
        value: 'Follow up on Enterprise Expansion',
        shortLabel: 'F',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Dario Amodei',
        tone: 'gray',
        kind: 'person',
        avatarUrl: avatars.darioAmodei,
      },
      dueDate: { type: 'text', value: 'Nov 1, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Anthropic',
        domain: 'anthropic.com',
      },
      status: { type: 'select', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-slack',
    cells: {
      title: {
        type: 'text',
        value: 'Schedule renewal call',
        shortLabel: 'S',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Stewart Butterfield',
        tone: 'teal',
        kind: 'person',
        avatarUrl: avatars.stewartButterfield,
      },
      dueDate: { type: 'text', value: 'Nov 2, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Slack',
        domain: 'slack.com',
      },
      status: { type: 'select', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-figma',
    cells: {
      title: {
        type: 'text',
        value: 'Send proposal to Dylan',
        shortLabel: 'S',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Dylan Field',
        tone: 'purple',
        kind: 'person',
        avatarUrl: avatars.dylanField,
      },
      dueDate: { type: 'text', value: 'Nov 3, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Figma',
        domain: 'figma.com',
      },
      status: { type: 'select', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-notion',
    cells: {
      title: {
        type: 'text',
        value: 'Review consolidation timeline',
        shortLabel: 'R',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Ivan Zhao',
        tone: 'gray',
        kind: 'person',
        avatarUrl: avatars.ivanZhao,
      },
      dueDate: { type: 'text', value: 'Nov 4, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Notion',
        domain: 'notion.com',
      },
      status: { type: 'select', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-github',
    cells: {
      title: {
        type: 'text',
        value: 'Check in on Copilot Rollout',
        shortLabel: 'C',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Thomas Dohmke',
        tone: 'gray',
        kind: 'person',
        avatarUrl: avatars.thomasDohmke,
      },
      dueDate: { type: 'text', value: 'Nov 5, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Github',
        domain: 'github.com',
      },
      status: { type: 'select', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-airbnb',
    cells: {
      title: {
        type: 'text',
        value: 'Review Host Ops proposal',
        shortLabel: 'R',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Brian Chesky',
        tone: 'pink',
        kind: 'person',
        avatarUrl: avatars.brianChesky,
      },
      dueDate: { type: 'text', value: 'Nov 6, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Airbnb',
        domain: 'airbnb.com',
      },
      status: { type: 'select', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-stripe',
    cells: {
      title: {
        type: 'text',
        value: 'Send billing expansion contract',
        shortLabel: 'S',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Patrick Collison',
        tone: 'blue',
        kind: 'person',
        avatarUrl: avatars.patrickCollison,
      },
      dueDate: { type: 'text', value: 'Nov 6, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Stripe',
        domain: 'stripe.com',
      },
      status: { type: 'select', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-sequoia',
    cells: {
      title: {
        type: 'text',
        value: 'Schedule quarterly review',
        shortLabel: 'S',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Roelof Botha',
        tone: 'green',
        kind: 'person',
        avatarUrl: avatars.roelofBotha,
      },
      dueDate: { type: 'text', value: 'Nov 7, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Sequoia',
        domain: 'sequoia.com',
      },
      status: { type: 'select', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-accel',
    cells: {
      title: {
        type: 'text',
        value: 'Follow up on Portfolio Sync',
        shortLabel: 'F',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Ping Li',
        tone: 'purple',
        kind: 'person',
        avatarUrl: avatars.pingLi,
      },
      dueDate: { type: 'text', value: 'Nov 7, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Accel',
        domain: 'accel.com',
      },
      status: { type: 'select', value: 'To Do' },
    },
  },
  {
    id: 'task-follow-up-google',
    cells: {
      title: {
        type: 'text',
        value: 'Prep AI Solutions deck',
        shortLabel: 'P',
        tone: 'teal',
      },
      assignee: {
        type: 'person',
        name: 'Sundar Pichai',
        tone: 'teal',
        kind: 'person',
        avatarUrl: avatars.sundarPichai,
      },
      dueDate: { type: 'text', value: 'Nov 8, 2023' },
      relatedTo: {
        type: 'entity',
        name: 'Google',
        domain: 'google.com',
      },
      status: { type: 'select', value: 'To Do' },
    },
  },
];
