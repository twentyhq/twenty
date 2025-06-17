import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

export interface NoteDataSeed {
  id: string;
  position: number;
  title: string;
  body: string | null;
  bodyV2Blocknote: string | null;
  bodyV2Markdown: string | null;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  createdByContext: string | null;
  [key: string]: unknown;
}

export const NOTE_DATA_SEED_COLUMNS: (keyof NoteDataSeed)[] = [
  'id',
  'position',
  'title',
  'body',
  'bodyV2Blocknote',
  'bodyV2Markdown',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'createdByContext',
];

// Generate all note IDs
const GENERATE_NOTE_IDS = (): Record<string, string> => {
  const NOTE_IDS: Record<string, string> = {};

  // Person notes (ID_1 to ID_1200)
  for (let INDEX = 1; INDEX <= 1200; INDEX++) {
    NOTE_IDS[`ID_${INDEX}`] =
      `30303030-n${INDEX.toString().padStart(3, '0')}-4e7c-b${INDEX.toString().padStart(3, '0')}-1234567890${((INDEX % 26) + 10).toString(36)}${(((INDEX + 1) % 26) + 10).toString(36)}`;
  }

  // Company notes (ID_1201 to ID_1800)
  for (let INDEX = 1201; INDEX <= 1800; INDEX++) {
    const COMPANY_INDEX = INDEX - 1200;

    NOTE_IDS[`ID_${INDEX}`] =
      `30303030-c${COMPANY_INDEX.toString().padStart(3, '0')}-4e7c-c${COMPANY_INDEX.toString().padStart(3, '0')}-1234567890${((COMPANY_INDEX % 26) + 10).toString(36)}${(((COMPANY_INDEX + 1) % 26) + 10).toString(36)}`;
  }

  return NOTE_IDS;
};

export const NOTE_DATA_SEED_IDS = GENERATE_NOTE_IDS();

// Sample credible note titles and contents
const PERSON_NOTE_TEMPLATES = [
  {
    title: 'Meeting Follow-up',
    content:
      'Great conversation today about potential collaboration opportunities. Next steps discussed include proposal review and timeline planning.',
  },
  {
    title: 'Project Update Discussion',
    content:
      'Reviewed current project status and identified key deliverables for the upcoming quarter. Timeline adjustments may be needed.',
  },
  {
    title: 'Skills & Experience Review',
    content:
      'Impressive background in technology and leadership. Strong potential for senior roles in upcoming projects.',
  },
  {
    title: 'Networking Connection',
    content:
      'Made connection at industry conference. Shared interests in digital transformation and innovation strategies.',
  },
  {
    title: 'Interview Notes',
    content:
      'Strong candidate with relevant experience. Technical skills align well with team requirements. Positive cultural fit assessment.',
  },
  {
    title: 'Performance Check-in',
    content:
      'Quarterly review completed. Exceeded targets in key areas. Discussed career development opportunities and growth plans.',
  },
  {
    title: 'Training & Development',
    content:
      'Completed certification program successfully. Ready to take on expanded responsibilities in the next phase.',
  },
  {
    title: 'Client Relationship Notes',
    content:
      'Long-standing professional relationship. Reliable partner for complex initiatives. High satisfaction ratings.',
  },
];

const COMPANY_NOTE_TEMPLATES = [
  {
    title: 'Partnership Opportunity',
    content:
      'Promising partnership potential identified. Complementary strengths in market reach and technical capabilities.',
  },
  {
    title: 'Vendor Assessment',
    content:
      'Comprehensive evaluation completed. Strong financial position and excellent service track record. Recommended for preferred vendor status.',
  },
  {
    title: 'Market Analysis',
    content:
      'Significant player in the industry with growing market share. Innovation-focused approach aligns with our strategic objectives.',
  },
  {
    title: 'Contract Negotiation',
    content:
      'Initial terms discussed. Competitive pricing structure proposed. Legal review scheduled for next phase.',
  },
  {
    title: 'Technology Integration',
    content:
      'Advanced technology stack compatible with our systems. Implementation timeline estimated at 6-8 weeks.',
  },
  {
    title: 'Due Diligence Report',
    content:
      'Financial health indicators positive. Strong leadership team and sustainable business model. Low risk assessment.',
  },
  {
    title: 'Customer Success Story',
    content:
      'Excellent case study of successful digital transformation. Results exceeded expectations with 40% efficiency improvement.',
  },
  {
    title: 'Industry Insights',
    content:
      'Valuable perspective on market trends and future opportunities. Thought leadership in emerging technologies.',
  },
];

// Generate note data seeds
const GENERATE_NOTE_SEEDS = (): NoteDataSeed[] => {
  const NOTE_SEEDS: NoteDataSeed[] = [];

  // Person notes (ID_1 to ID_1200)
  for (let INDEX = 1; INDEX <= 1200; INDEX++) {
    const TEMPLATE_INDEX = (INDEX - 1) % PERSON_NOTE_TEMPLATES.length;
    const TEMPLATE = PERSON_NOTE_TEMPLATES[TEMPLATE_INDEX];

    NOTE_SEEDS.push({
      id: NOTE_DATA_SEED_IDS[`ID_${INDEX}`],
      position: INDEX,
      title: TEMPLATE.title,
      body: null,
      bodyV2Blocknote: JSON.stringify([
        {
          id: `block-${INDEX}`,
          type: 'paragraph',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
          content: [{ type: 'text', text: TEMPLATE.content, styles: {} }],
          children: [],
        },
      ]),
      bodyV2Markdown: TEMPLATE.content,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      createdByName: 'Tim A',
      createdByContext: null,
    });
  }

  // Company notes (ID_1201 to ID_1800)
  for (let INDEX = 1201; INDEX <= 1800; INDEX++) {
    const TEMPLATE_INDEX = (INDEX - 1201) % COMPANY_NOTE_TEMPLATES.length;
    const TEMPLATE = COMPANY_NOTE_TEMPLATES[TEMPLATE_INDEX];

    NOTE_SEEDS.push({
      id: NOTE_DATA_SEED_IDS[`ID_${INDEX}`],
      position: INDEX,
      title: TEMPLATE.title,
      body: null,
      bodyV2Blocknote: JSON.stringify([
        {
          id: `block-${INDEX}`,
          type: 'paragraph',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
          content: [{ type: 'text', text: TEMPLATE.content, styles: {} }],
          children: [],
        },
      ]),
      bodyV2Markdown: TEMPLATE.content,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      createdByName: 'Tim A',
      createdByContext: null,
    });
  }

  return NOTE_SEEDS;
};

export const NOTE_DATA_SEEDS = GENERATE_NOTE_SEEDS();
