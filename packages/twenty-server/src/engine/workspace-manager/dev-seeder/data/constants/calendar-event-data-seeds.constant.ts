type CalendarEventDataSeed = {
  id: string;
  title: string;
  isCanceled: boolean;
  isFullDay: boolean;
  startsAt: string;
  endsAt: string;
  externalCreatedAt: string;
  externalUpdatedAt: string;
  description: string;
  location: string;
  iCalUid: string;
  conferenceSolution: string;
  conferenceLinkPrimaryLinkLabel: string;
  conferenceLinkPrimaryLinkUrl: string;
};

export const CALENDAR_EVENT_DATA_SEED_COLUMNS: (keyof CalendarEventDataSeed)[] =
  [
    'id',
    'title',
    'isCanceled',
    'isFullDay',
    'startsAt',
    'endsAt',
    'externalCreatedAt',
    'externalUpdatedAt',
    'description',
    'location',
    'iCalUid',
    'conferenceSolution',
    'conferenceLinkPrimaryLinkLabel',
    'conferenceLinkPrimaryLinkUrl',
  ];

const GENERATE_CALENDAR_EVENT_IDS = (): Record<string, string> => {
  const CALENDAR_EVENT_IDS: Record<string, string> = {};

  for (let INDEX = 1; INDEX <= 800; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    CALENDAR_EVENT_IDS[`ID_${INDEX}`] =
      `20202020-${HEX_INDEX}-4e7c-8001-123456789cde`;
  }

  return CALENDAR_EVENT_IDS;
};

export const CALENDAR_EVENT_DATA_SEED_IDS = GENERATE_CALENDAR_EVENT_IDS();

const EVENT_TEMPLATES = [
  {
    title: 'Team Standup',
    description:
      'Daily team synchronization meeting to discuss progress and blockers.',
    isFullDay: false,
    duration: 30, // minutes
    locations: ['Conference Room A', 'Zoom', 'Teams'],
    conferenceSolutions: ['Zoom', 'Teams', 'Google Meet'],
  },
  {
    title: 'Client Presentation',
    description:
      'Present project progress and next steps to client stakeholders.',
    isFullDay: false,
    duration: 60,
    locations: ['Client Office', 'Zoom', 'Conference Room B'],
    conferenceSolutions: ['Zoom', 'Teams', 'Google Meet'],
  },
  {
    title: 'Project Planning Session',
    description:
      'Strategic planning session for upcoming project milestones and deliverables.',
    isFullDay: false,
    duration: 90,
    locations: ['Conference Room C', 'Teams', 'Boardroom'],
    conferenceSolutions: ['Teams', 'Zoom', 'Google Meet'],
  },
  {
    title: 'One-on-One Meeting',
    description:
      'Regular one-on-one check-in to discuss performance and career development.',
    isFullDay: false,
    duration: 45,
    locations: ['Office', 'Zoom', 'Coffee Shop'],
    conferenceSolutions: ['Zoom', 'Teams', 'Google Meet'],
  },
  {
    title: 'Code Review Session',
    description: 'Collaborative code review and technical discussion.',
    isFullDay: false,
    duration: 60,
    locations: ['Dev Room', 'Zoom', 'Teams'],
    conferenceSolutions: ['Zoom', 'Teams', 'Google Meet'],
  },
  {
    title: 'Strategic Planning Workshop',
    description: 'Quarterly strategic planning and goal setting workshop.',
    isFullDay: true,
    duration: 480, // 8 hours
    locations: ['Offsite Location', 'Headquarters', 'Conference Center'],
    conferenceSolutions: ['Zoom', 'Teams', 'Google Meet'],
  },
  {
    title: 'Training Session',
    description: 'Professional development and skills training session.',
    isFullDay: false,
    duration: 120,
    locations: ['Training Room', 'Zoom', 'Teams'],
    conferenceSolutions: ['Zoom', 'Teams', 'Google Meet'],
  },
  {
    title: 'Customer Discovery Call',
    description: 'Customer interview to gather feedback and understand needs.',
    isFullDay: false,
    duration: 45,
    locations: ['Phone', 'Zoom', 'Teams'],
    conferenceSolutions: ['Zoom', 'Teams', 'Google Meet'],
  },
  {
    title: 'Budget Review Meeting',
    description: 'Quarterly budget review and financial planning session.',
    isFullDay: false,
    duration: 90,
    locations: ['Finance Office', 'Conference Room D', 'Zoom'],
    conferenceSolutions: ['Zoom', 'Teams', 'Google Meet'],
  },
  {
    title: 'Product Demo',
    description:
      'Product demonstration for potential customers and stakeholders.',
    isFullDay: false,
    duration: 60,
    locations: ['Demo Room', 'Zoom', 'Client Site'],
    conferenceSolutions: ['Zoom', 'Teams', 'Google Meet'],
  },
  {
    title: 'All Hands Meeting',
    description: 'Company-wide meeting for updates and announcements.',
    isFullDay: false,
    duration: 60,
    locations: ['Main Auditorium', 'Zoom', 'Teams'],
    conferenceSolutions: ['Zoom', 'Teams', 'Google Meet'],
  },
  {
    title: 'Sprint Retrospective',
    description:
      'Team retrospective to discuss what went well and areas for improvement.',
    isFullDay: false,
    duration: 75,
    locations: ['Conference Room E', 'Teams', 'Zoom'],
    conferenceSolutions: ['Teams', 'Zoom', 'Google Meet'],
  },
];

const GENERATE_CALENDAR_EVENT_SEEDS = (): CalendarEventDataSeed[] => {
  const CALENDAR_EVENT_SEEDS: CalendarEventDataSeed[] = [];

  for (let INDEX = 1; INDEX <= 800; INDEX++) {
    const TEMPLATE_INDEX = (INDEX - 1) % EVENT_TEMPLATES.length;
    const TEMPLATE = EVENT_TEMPLATES[TEMPLATE_INDEX];

    // Random date within the last 6 months and next 6 months
    const NOW = new Date();
    const RANDOM_DAYS_OFFSET = Math.floor(Math.random() * 365) - 182; // -182 to +182 days
    const EVENT_DATE = new Date(
      NOW.getTime() + RANDOM_DAYS_OFFSET * 24 * 60 * 60 * 1000,
    );

    // Random time between 9 AM and 6 PM
    const START_HOUR = 9 + Math.floor(Math.random() * 9);
    const START_MINUTE = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes

    const START_TIME = new Date(EVENT_DATE);

    START_TIME.setHours(START_HOUR, START_MINUTE, 0, 0);

    const END_TIME = new Date(START_TIME);

    if (TEMPLATE.isFullDay) {
      END_TIME.setDate(END_TIME.getDate() + 1);
      END_TIME.setHours(0, 0, 0, 0);
    } else {
      END_TIME.setMinutes(END_TIME.getMinutes() + TEMPLATE.duration);
    }

    // Random location and conference solution
    const LOCATION =
      TEMPLATE.locations[Math.floor(Math.random() * TEMPLATE.locations.length)];
    const CONFERENCE_SOLUTION =
      TEMPLATE.conferenceSolutions[
        Math.floor(Math.random() * TEMPLATE.conferenceSolutions.length)
      ];

    // 5% chance of being cancelled
    const IS_CANCELLED = Math.random() < 0.05;

    // Generate conference link if it's an online meeting
    const CONFERENCE_LINK = ['Zoom', 'Teams', 'Google Meet'].includes(
      CONFERENCE_SOLUTION,
    )
      ? `https://${CONFERENCE_SOLUTION.toLowerCase().replace(' ', '')}.com/j/${Math.floor(Math.random() * 9000000000) + 1000000000}`
      : '';

    CALENDAR_EVENT_SEEDS.push({
      id: CALENDAR_EVENT_DATA_SEED_IDS[`ID_${INDEX}`],
      title: TEMPLATE.title,
      isCanceled: IS_CANCELLED,
      isFullDay: TEMPLATE.isFullDay,
      startsAt: START_TIME.toISOString(),
      endsAt: END_TIME.toISOString(),
      externalCreatedAt: new Date(
        START_TIME.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      externalUpdatedAt: new Date(
        START_TIME.getTime() - Math.random() * 24 * 60 * 60 * 1000,
      ).toISOString(),
      description: TEMPLATE.description,
      location: LOCATION,
      iCalUid: `event${INDEX}@calendar.twentycrm.com`,
      conferenceSolution: CONFERENCE_SOLUTION,
      conferenceLinkPrimaryLinkLabel: CONFERENCE_LINK,
      conferenceLinkPrimaryLinkUrl: CONFERENCE_LINK,
    });
  }

  return CALENDAR_EVENT_SEEDS;
};

export const CALENDAR_EVENT_DATA_SEEDS = GENERATE_CALENDAR_EVENT_SEEDS();
