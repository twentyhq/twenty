import { sharedAssetUrls } from '../data/shared-asset-urls';
import { type RecordPageDefinition } from '../types';

const avatars = sharedAssetUrls.peopleAvatars;

// The company record the collaborative cursor tour opens and reads.
export const ANTHROPIC_RECORD_PAGE: RecordPageDefinition = {
  type: 'record',
  header: {
    title: 'Anthropic',
    count: 12,
  },
  record: {
    logoDomain: 'anthropic.com',
    name: 'Anthropic',
    createdAt: 'Created 4 hours ago',
    fields: [
      {
        icon: 'link',
        label: 'URL',
        value: { type: 'link', kind: 'url', value: 'anthropic.com' },
      },
      {
        icon: 'user',
        label: 'Account Owner',
        value: {
          type: 'person',
          name: 'Dario Amodei',
          avatarUrl: avatars.darioAmodei,
          kind: 'person',
          tone: 'gray',
        },
      },
      {
        icon: 'mapPin',
        label: 'Address',
        value: { type: 'text', value: '18 Rue De Navarin' },
      },
      {
        icon: 'check',
        label: 'ICP',
        value: { type: 'boolean', value: true },
      },
      {
        icon: 'currency',
        label: 'ARR',
        value: { type: 'currency', value: '$500,000' },
      },
      {
        icon: 'linkedin',
        label: 'LinkedIn',
        value: {
          type: 'link',
          kind: 'social',
          label: 'linkedin.com/company/a...',
          value: 'anthropic',
        },
      },
    ],
    moreCount: 12,
    relations: [
      {
        title: 'Opportunities',
        items: [{ name: 'Enterprise Expansion', domain: 'anthropic.com' }],
      },
      {
        title: 'People',
        count: 12,
        items: [
          {
            name: 'Dario Amodei',
            avatarUrl: avatars.darioAmodei,
          },
        ],
      },
    ],
  },
  notes: [
    {
      id: 'kickoff',
      title: 'Kickoff with Dario',
      body: 'Walked through the enterprise expansion plan and the security review timeline. Anthropic wants SSO, audit logs, and a dedicated environment before rolling out to the wider research org.',
      relation: {
        name: 'Dario Amodei',
        avatarUrl: avatars.darioAmodei,
      },
    },
    {
      id: 'pricing-follow-up',
      title: 'Follow-up on pricing',
      body: 'Shared updated seat pricing and the annual commitment options. Next step is a procurement intro and a technical deep-dive with their platform team.',
    },
  ],
  timeline: [
    {
      kind: 'calendar',
      id: 'calendar-security-review',
      actor: 'Alice',
      title: 'Security review',
      detail: 'Tomorrow · 10:00 – 10:45 AM · Dario Amodei, Alice',
      time: '1 hour ago',
    },
    {
      kind: 'note',
      id: 'note-kickoff',
      actor: 'Alice',
      title: 'Kickoff with Dario',
      time: '2 hours ago',
    },
    {
      kind: 'updated',
      id: 'update-multi',
      actor: 'Alice',
      record: 'Anthropic',
      time: '3 hours ago',
      diffs: [
        { label: 'Industry', value: { type: 'select', value: 'AI Research' } },
        { label: 'Employees', value: { type: 'text', value: '612' } },
        { label: 'ICP', value: { type: 'boolean', value: true } },
      ],
    },
    {
      kind: 'updated',
      id: 'update-arr',
      actor: 'Alice',
      record: 'Anthropic',
      time: '3 hours ago',
      diffs: [{ label: 'ARR', value: { type: 'currency', value: '$500,000' } }],
    },
    {
      kind: 'created',
      id: 'record-created',
      subject: 'Anthropic',
      actor: 'Dario Amodei',
      time: '4 hours ago',
    },
  ],
  tasks: [
    {
      id: 'task-agreement',
      title: 'Send enterprise agreement',
      body: 'Final redlines from legal',
      due: 'Tomorrow',
      target: {
        name: 'Dario Amodei',
        avatarUrl: avatars.darioAmodei,
        tone: 'gray',
      },
    },
    {
      id: 'task-security',
      title: 'Complete security review',
      body: 'SOC 2 and DPA sign-off',
      due: 'Friday',
      done: true,
      target: { name: 'Enterprise Expansion', domain: 'anthropic.com' },
    },
    {
      id: 'task-procurement',
      title: 'Schedule procurement intro',
      body: 'Loop in their procurement lead',
      due: 'Next week',
      target: { name: 'Alice', tone: 'amber' },
    },
  ],
  files: [
    {
      id: 'file-agreement',
      name: 'Enterprise Agreement.pdf',
      category: 'pdf',
      date: '2 hours ago',
    },
    {
      id: 'file-security',
      name: 'Security Review.xlsx',
      category: 'sheet',
      date: '1 day ago',
    },
    {
      id: 'file-pricing',
      name: 'Pricing Proposal.pdf',
      category: 'pdf',
      date: '3 days ago',
    },
  ],
  emails: [
    {
      id: 'email-expansion',
      participants: [
        {
          name: 'Dario Amodei',
          avatarUrl: avatars.darioAmodei,
          tone: 'gray',
        },
        { name: 'Alice', tone: 'amber' },
      ],
      count: 3,
      subject: 'Re: Enterprise expansion',
      body: 'Thanks for the detailed proposal — looping in our platform team.',
      date: '2 hours ago',
    },
    {
      id: 'email-compliance',
      participants: [
        { name: 'Alice', tone: 'amber' },
        {
          name: 'Dario Amodei',
          avatarUrl: avatars.darioAmodei,
          tone: 'gray',
        },
      ],
      count: 2,
      subject: 'Security & compliance docs',
      body: 'Attaching the SOC 2 report and our DPA for review.',
      date: '1 day ago',
    },
    {
      id: 'email-procurement',
      participants: [
        {
          name: 'Dario Amodei',
          avatarUrl: avatars.darioAmodei,
          tone: 'gray',
        },
      ],
      count: 1,
      subject: 'Intro to procurement',
      body: 'Connecting you with our procurement lead to move the contract forward.',
      date: '2 days ago',
    },
  ],
  calendar: [
    {
      id: 'cal-day-wed',
      weekday: 'Wed',
      day: '12',
      events: [
        {
          id: 'cal-security',
          start: '10:00',
          end: '10:45',
          title: 'Security review',
          attending: true,
          participants: [
            {
              name: 'Dario Amodei',
              avatarUrl: avatars.darioAmodei,
              tone: 'gray',
            },
            { name: 'Alice', tone: 'amber' },
          ],
        },
      ],
    },
    {
      id: 'cal-day-fri',
      weekday: 'Fri',
      day: '14',
      events: [
        {
          id: 'cal-qbr',
          start: '14:00',
          end: '15:00',
          title: 'Quarterly business review',
          participants: [
            {
              name: 'Dario Amodei',
              avatarUrl: avatars.darioAmodei,
              tone: 'gray',
            },
            { name: 'Alice', tone: 'amber' },
            {
              name: 'Marcus Lee',
              avatarUrl: avatars.anonymousMike,
              tone: 'amber',
            },
          ],
        },
      ],
    },
  ],
};
