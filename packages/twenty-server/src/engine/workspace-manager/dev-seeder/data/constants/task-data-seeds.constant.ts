import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type TaskDataSeed = {
  id: string;
  position: number;
  title: string;
  bodyV2Blocknote: string;
  bodyV2Markdown: string;
  status: string;
  dueAt: string | null;
  assigneeId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  updatedBySource: string;
  updatedByWorkspaceMemberId: string;
  updatedByName: string;
};

export const TASK_DATA_SEED_COLUMNS: (keyof TaskDataSeed)[] = [
  'id',
  'position',
  'title',
  'bodyV2Blocknote',
  'bodyV2Markdown',
  'status',
  'dueAt',
  'assigneeId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'updatedBySource',
  'updatedByWorkspaceMemberId',
  'updatedByName',
];

// Generate all task IDs
const GENERATE_TASK_IDS = (): Record<string, string> => {
  const TASK_IDS: Record<string, string> = {};

  // Person tasks (ID_1 to ID_1200)
  for (let INDEX = 1; INDEX <= 1200; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    TASK_IDS[`ID_${INDEX}`] = `20202020-${HEX_INDEX}-4e7c-8001-123456789def`;
  }

  // Company tasks (ID_1201 to ID_1800)
  for (let INDEX = 1201; INDEX <= 1800; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    TASK_IDS[`ID_${INDEX}`] = `20202020-${HEX_INDEX}-4e7c-9001-123456789def`;
  }

  return TASK_IDS;
};

export const TASK_DATA_SEED_IDS = GENERATE_TASK_IDS();

// Sample credible task titles and contents for person-related tasks
const PERSON_TASK_TEMPLATES = [
  {
    title: 'Schedule follow-up call',
    body: 'Arrange a follow-up call to discuss project details and next steps.',
    status: 'TODO',
    daysFromNow: 3,
  },
  {
    title: 'Send project proposal',
    body: 'Prepare and send the project proposal document with timeline and deliverables.',
    status: 'IN_PROGRESS',
    daysFromNow: 5,
  },
  {
    title: 'Review contract terms',
    body: 'Review the contract terms and conditions before final approval.',
    status: 'TODO',
    daysFromNow: 7,
  },
  {
    title: 'Prepare meeting agenda',
    body: 'Create detailed agenda for upcoming strategy meeting.',
    status: 'TODO',
    daysFromNow: 2,
  },
  {
    title: 'Update contact information',
    body: 'Verify and update contact details in the system.',
    status: 'DONE',
    daysFromNow: null,
  },
  {
    title: 'Conduct reference check',
    body: 'Complete reference verification for background check process.',
    status: 'IN_PROGRESS',
    daysFromNow: 4,
  },
  {
    title: 'Share portfolio samples',
    body: 'Send portfolio examples and case studies for review.',
    status: 'TODO',
    daysFromNow: 6,
  },
  {
    title: 'Set up onboarding process',
    body: 'Prepare onboarding materials and schedule orientation session.',
    status: 'TODO',
    daysFromNow: 8,
  },
];

// Sample credible task titles and contents for company-related tasks
const COMPANY_TASK_TEMPLATES = [
  {
    title: 'Conduct vendor evaluation',
    body: 'Complete comprehensive evaluation of vendor capabilities and pricing.',
    status: 'IN_PROGRESS',
    daysFromNow: 10,
  },
  {
    title: 'Negotiate contract terms',
    body: 'Review and negotiate contract terms for upcoming partnership.',
    status: 'TODO',
    daysFromNow: 14,
  },
  {
    title: 'Schedule demo presentation',
    body: 'Arrange product demonstration for stakeholder review.',
    status: 'TODO',
    daysFromNow: 7,
  },
  {
    title: 'Prepare RFP response',
    body: 'Draft comprehensive response to Request for Proposal.',
    status: 'IN_PROGRESS',
    daysFromNow: 12,
  },
  {
    title: 'Update compliance documentation',
    body: 'Review and update all compliance and certification documents.',
    status: 'TODO',
    daysFromNow: 21,
  },
  {
    title: 'Analyze market research',
    body: 'Review market analysis report and competitive landscape.',
    status: 'DONE',
    daysFromNow: null,
  },
  {
    title: 'Plan integration strategy',
    body: 'Develop technical integration plan and implementation timeline.',
    status: 'TODO',
    daysFromNow: 15,
  },
  {
    title: 'Review financial statements',
    body: 'Analyze latest financial reports and performance metrics.',
    status: 'IN_PROGRESS',
    daysFromNow: 5,
  },
];

// Helper function to get random workspace member
const GET_RANDOM_ASSIGNEE = (): string => {
  const MEMBERS = [
    WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
  ];

  return MEMBERS[Math.floor(Math.random() * MEMBERS.length)];
};

// Helper function to format due date
const FORMAT_DUE_DATE = (daysFromNow: number | null): string | null => {
  if (daysFromNow === null) return null;

  const DATE = new Date();

  DATE.setDate(DATE.getDate() + daysFromNow);

  return DATE.toISOString();
};

// Generate task data seeds
const GENERATE_TASK_SEEDS = (): TaskDataSeed[] => {
  const TASK_SEEDS: TaskDataSeed[] = [];

  // Person tasks (ID_1 to ID_1200)
  for (let INDEX = 1; INDEX <= 1200; INDEX++) {
    const TEMPLATE_INDEX = (INDEX - 1) % PERSON_TASK_TEMPLATES.length;
    const TEMPLATE = PERSON_TASK_TEMPLATES[TEMPLATE_INDEX];

    TASK_SEEDS.push({
      id: TASK_DATA_SEED_IDS[`ID_${INDEX}`],
      position: INDEX,
      title: TEMPLATE.title,
      bodyV2Blocknote: JSON.stringify([
        {
          id: `block-${INDEX}`,
          type: 'paragraph',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
          content: [{ type: 'text', text: TEMPLATE.body, styles: {} }],
          children: [],
        },
      ]),
      bodyV2Markdown: TEMPLATE.body,
      status: TEMPLATE.status,
      dueAt: FORMAT_DUE_DATE(TEMPLATE.daysFromNow),
      assigneeId: GET_RANDOM_ASSIGNEE(),
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      createdByName: 'Tim A',
      updatedBySource: 'MANUAL',
      updatedByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      updatedByName: 'Tim A',
    });
  }

  // Company tasks (ID_1201 to ID_1800)
  for (let INDEX = 1201; INDEX <= 1800; INDEX++) {
    const TEMPLATE_INDEX = (INDEX - 1201) % COMPANY_TASK_TEMPLATES.length;
    const TEMPLATE = COMPANY_TASK_TEMPLATES[TEMPLATE_INDEX];

    TASK_SEEDS.push({
      id: TASK_DATA_SEED_IDS[`ID_${INDEX}`],
      position: INDEX,
      title: TEMPLATE.title,
      bodyV2Blocknote: JSON.stringify([
        {
          id: `block-${INDEX}`,
          type: 'paragraph',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
          content: [{ type: 'text', text: TEMPLATE.body, styles: {} }],
          children: [],
        },
      ]),
      bodyV2Markdown: TEMPLATE.body,
      status: TEMPLATE.status,
      dueAt: FORMAT_DUE_DATE(TEMPLATE.daysFromNow),
      assigneeId: GET_RANDOM_ASSIGNEE(),
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      createdByName: 'Tim A',
      updatedBySource: 'MANUAL',
      updatedByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      updatedByName: 'Tim A',
    });
  }

  return TASK_SEEDS;
};

export const TASK_DATA_SEEDS = GENERATE_TASK_SEEDS();
