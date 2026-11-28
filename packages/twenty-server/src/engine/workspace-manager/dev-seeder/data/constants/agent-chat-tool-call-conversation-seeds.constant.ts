import { AGENT_CHAT_TOOL_CALL_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/agent-chat-seeds.constant';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { NOTE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/note-data-seeds.constant';
import { OPPORTUNITY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { TASK_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/task-data-seeds.constant';
import { buildExecuteToolSeedStep } from 'src/engine/workspace-manager/dev-seeder/data/utils/build-execute-tool-seed-step.util';
import { type SeededToolStep } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-step.type';

type AgentChatToolCallConversationSeed = {
  threadId: string;
  title: string;
  prompt: string;
  steps: SeededToolStep[];
  reply: string;
};

const OPEN_DEALS = [
  {
    recordId: OPPORTUNITY_DATA_SEED_IDS.ID_3,
    displayName: 'iPhone Corporate Program',
  },
  {
    recordId: OPPORTUNITY_DATA_SEED_IDS.ID_1,
    displayName: 'Enterprise iPad Deployment',
  },
  {
    recordId: OPPORTUNITY_DATA_SEED_IDS.ID_2,
    displayName: 'MacBook Pro Fleet Upgrade',
  },
  {
    recordId: OPPORTUNITY_DATA_SEED_IDS.ID_5,
    displayName: 'Mac Studio Creative Suite',
  },
  {
    recordId: OPPORTUNITY_DATA_SEED_IDS.ID_6,
    displayName: 'iPad Pro Design Team Setup',
  },
  {
    recordId: OPPORTUNITY_DATA_SEED_IDS.ID_4,
    displayName: 'Apple TV+ Enterprise License',
  },
  {
    recordId: OPPORTUNITY_DATA_SEED_IDS.ID_7,
    displayName: 'Apple Watch Corporate Wellness',
  },
].map((deal) => ({ ...deal, objectNameSingular: 'opportunity' }));

const GOOGLE_CONTACTS = [
  { recordId: PERSON_DATA_SEED_IDS.ID_1, displayName: 'Mark Young' },
  { recordId: PERSON_DATA_SEED_IDS.ID_2, displayName: 'Gabriel Robinson' },
  { recordId: PERSON_DATA_SEED_IDS.ID_3, displayName: 'Kimberly Gordon' },
].map((person) => ({ ...person, objectNameSingular: 'person' }));

const GOOGLE_REFERENCE = {
  objectNameSingular: 'company',
  recordId: COMPANY_DATA_SEED_IDS.ID_1,
  displayName: 'Google',
};

const META_RECAP_EMAIL = {
  recipients: { to: 'it@meta.example', cc: '', bcc: '' },
  subject: 'Recap of our kickoff',
  body: {
    type: 'html',
    html: '<p>Hi team,</p><p>Thanks for the kickoff. We agreed on the data import this week and the SSO setup the week after.</p><p>Best,<br>Tim</p>',
  },
};

export const AGENT_CHAT_TOOL_CALL_CONVERSATION_SEEDS: AgentChatToolCallConversationSeed[] =
  [
    {
      threadId: AGENT_CHAT_TOOL_CALL_THREAD_DATA_SEED_IDS.RECORD_LOOKUPS,
      title: 'Review the biggest open deals',
      prompt:
        'Which open deals are the biggest, and how do they split by stage?',
      steps: [
        {
          toolName: 'load_skills',
          input: { skillNames: ['data-manipulation'] },
          output: {
            skills: [{ name: 'data-manipulation', label: 'Data Manipulation' }],
          },
          reasoning:
            'The answer needs the open opportunities sorted by amount, then a count per stage.',
        },
        {
          toolName: 'learn_tools',
          input: {
            toolNames: ['find_many_opportunities', 'group_by_opportunities'],
            aspects: ['description', 'schema'],
          },
          output: {
            message:
              'Learned 2 tools: find_many_opportunities, group_by_opportunities.',
            tools: [
              { name: 'find_many_opportunities', label: 'Find opportunities' },
              { name: 'group_by_opportunities', label: 'Group opportunities' },
            ],
          },
        },
        buildExecuteToolSeedStep({
          toolName: 'find_many_opportunities',
          toolArguments: {
            select: ['name', 'amount', 'stage'],
            stage: { neq: 'CUSTOMER' },
            orderBy: [{ amount: { amountMicros: 'DescNullsLast' } }],
            limit: 7,
          },
          message: 'Found 7 opportunity records',
          result: {
            count: '7',
            hasNextPage: true,
            records: OPEN_DEALS.map(({ recordId, displayName }) => ({
              id: recordId,
              name: displayName,
            })),
          },
          recordReferences: OPEN_DEALS,
        }),
        buildExecuteToolSeedStep({
          toolName: 'group_by_opportunities',
          toolArguments: {
            groupBy: [{ stage: true }],
            aggregateOperation: 'COUNT',
            orderBy: 'DESC',
          },
          message: 'Grouped opportunity by stage: 4 groups',
          result: {
            aggregation: 'COUNT',
            dimensionLabels: ['stage'],
            groupCount: 4,
            groups: [
              { value: '39', dimensions: ['PROPOSAL'] },
              { value: '36', dimensions: ['MEETING'] },
              { value: '30', dimensions: ['NEW'] },
              { value: '24', dimensions: ['SCREENING'] },
            ],
          },
          reasoning: 'A count per stage shows where the pipeline sits.',
        }),
      ],
      reply:
        'The biggest open deal is **iPhone Corporate Program** at $3.2M, followed by **Enterprise iPad Deployment** at $2.5M and **MacBook Pro Fleet Upgrade** at $1.8M.\n\n| Stage | Deals |\n| --- | --- |\n| Proposal | 39 |\n| Meeting | 36 |\n| New | 30 |\n| Screening | 24 |',
    },
    {
      threadId: AGENT_CHAT_TOOL_CALL_THREAD_DATA_SEED_IDS.RECORD_CHANGES,
      title: 'Prepare the Google renewal',
      prompt:
        'Google renews next month. Find our contacts there, add a task to call them and note where the deal stands.',
      steps: [
        buildExecuteToolSeedStep({
          toolName: 'find_many_companies',
          toolArguments: { select: ['name'], name: { ilike: '%Google%' } },
          message: 'Found 1 company records',
          result: {
            count: '1',
            hasNextPage: false,
            records: [{ id: GOOGLE_REFERENCE.recordId, name: 'Google' }],
          },
          recordReferences: [GOOGLE_REFERENCE],
          reasoning:
            'Start from the company so the contacts, the task and the note all attach to it.',
        }),
        buildExecuteToolSeedStep({
          toolName: 'find_many_people',
          toolArguments: {
            select: ['name', 'jobTitle'],
            companyId: { eq: GOOGLE_REFERENCE.recordId },
          },
          message: 'Found 3 person records',
          result: {
            count: '3',
            hasNextPage: false,
            records: GOOGLE_CONTACTS.map(({ recordId, displayName }) => ({
              id: recordId,
              name: displayName,
            })),
          },
          recordReferences: GOOGLE_CONTACTS,
        }),
        buildExecuteToolSeedStep({
          toolName: 'create_one_task',
          toolArguments: {
            title: 'Schedule follow-up call',
            status: 'TODO',
            dueAt: '2026-12-02T09:00:00.000Z',
          },
          message: 'Created task record',
          result: {
            id: TASK_DATA_SEED_IDS.ID_1,
            title: 'Schedule follow-up call',
          },
          recordReferences: [
            {
              objectNameSingular: 'task',
              recordId: TASK_DATA_SEED_IDS.ID_1,
              displayName: 'Schedule follow-up call',
            },
          ],
        }),
        buildExecuteToolSeedStep({
          toolName: 'update_one_opportunity',
          toolArguments: {
            id: OPPORTUNITY_DATA_SEED_IDS.ID_1,
            stage: 'MEETING',
          },
          message: 'Updated opportunity record',
          result: {
            id: OPPORTUNITY_DATA_SEED_IDS.ID_1,
            name: 'Enterprise iPad Deployment',
            stage: 'MEETING',
          },
          recordReferences: [
            {
              objectNameSingular: 'opportunity',
              recordId: OPPORTUNITY_DATA_SEED_IDS.ID_1,
              displayName: 'Enterprise iPad Deployment',
            },
          ],
        }),
        buildExecuteToolSeedStep({
          toolName: 'create_one_note',
          toolArguments: {
            title: 'Meeting Follow-up',
            bodyV2: {
              markdown:
                'Renewal due next month. Call scheduled with Mark Young.',
            },
          },
          message: 'Created note record',
          result: { id: NOTE_DATA_SEED_IDS.ID_1, title: 'Meeting Follow-up' },
          recordReferences: [
            {
              objectNameSingular: 'note',
              recordId: NOTE_DATA_SEED_IDS.ID_1,
              displayName: 'Meeting Follow-up',
            },
          ],
        }),
      ],
      reply:
        'Google has three contacts on file: Mark Young, Gabriel Robinson and Kimberly Gordon. I added a task to call them, moved the deal to Meeting and left a note on where the renewal stands.',
    },
    {
      threadId: AGENT_CHAT_TOOL_CALL_THREAD_DATA_SEED_IDS.WEB_RESEARCH,
      title: 'Research Microsoft before the call',
      prompt:
        'I have a call with Microsoft tomorrow. What happened there recently, and is their status page reporting anything?',
      steps: [
        {
          toolName: 'web_search',
          input: { query: 'Microsoft announcements this month' },
          output: {
            action: {
              type: 'search',
              query: 'Microsoft announcements this month',
            },
            sources: [
              { type: 'url', url: 'https://news.example.com/microsoft' },
              { type: 'url', url: 'https://blog.example.com/microsoft-recap' },
            ],
          },
          providerExecuted: true,
        },
        buildExecuteToolSeedStep({
          toolName: 'http_request',
          toolArguments: {
            url: 'https://status.example.com/api/summary.json',
            method: 'GET',
          },
          errorText:
            'HTTP GET request to https://status.example.com/api/summary.json failed\nThe request timed out after 30000 ms.',
          reasoning: 'The status page exposes a JSON summary.',
        }),
        buildExecuteToolSeedStep({
          toolName: 'http_request',
          toolArguments: {
            url: 'https://status.example.com/api/summary.json',
            method: 'GET',
          },
          message:
            'HTTP GET request to https://status.example.com/api/summary.json succeeded',
          result: {
            status: 200,
            data: {
              status: { indicator: 'none', description: 'All systems normal' },
              incidents: [],
            },
          },
          reasoning: 'The first request timed out, so it is worth one retry.',
        }),
        buildExecuteToolSeedStep({
          toolName: 'search_help_center',
          toolArguments: { query: 'Microsoft calendar sync' },
          message: 'Found 2 help center articles',
          result: {
            articles: [
              { title: 'Connect a Microsoft account' },
              { title: 'Sync calendar events' },
            ],
          },
        }),
      ],
      reply:
        'Two things worth mentioning tomorrow: their announcements this month, and the fact that their status page reports all systems normal (it timed out once, then answered). If calendar sync comes up, the help center has a guide for connecting a Microsoft account.',
    },
    {
      threadId: AGENT_CHAT_TOOL_CALL_THREAD_DATA_SEED_IDS.EMAIL_RECAP,
      title: 'Send the kickoff recap to Meta',
      prompt: 'Send Meta a short recap of this morning’s kickoff.',
      steps: [
        buildExecuteToolSeedStep({
          toolName: 'find_connected_accounts',
          toolArguments: {},
          message: 'Found 1 connected account',
          result: {
            connectedAccounts: [
              { handle: 'tim@apple.dev', provider: 'google' },
            ],
          },
        }),
        buildExecuteToolSeedStep({
          toolName: 'draft_email',
          toolArguments: META_RECAP_EMAIL,
          message: 'Draft saved',
          result: { subject: META_RECAP_EMAIL.subject },
          reasoning: 'A draft first, so the wording can be checked.',
        }),
        buildExecuteToolSeedStep({
          toolName: 'send_email',
          toolArguments: META_RECAP_EMAIL,
          message: 'Email sent successfully',
          result: {
            recipients: 1,
            subject: META_RECAP_EMAIL.subject,
          },
        }),
      ],
      reply:
        'Sent from tim@apple.dev. The recap covers the data import this week and the SSO setup the week after.',
    },
  ];
