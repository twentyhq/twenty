import { MESSAGE_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-thread-data-seeds.constant';

type MessageDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  receivedAt: Date;
  text: string;
  subject: string;
  messageThreadId: string;
  headerMessageId: string;
};

export const MESSAGE_DATA_SEED_COLUMNS: (keyof MessageDataSeed)[] = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'receivedAt',
  'text',
  'subject',
  'messageThreadId',
  'headerMessageId',
];

const GENERATE_MESSAGE_IDS = (): Record<string, string> => {
  const MESSAGE_IDS: Record<string, string> = {};

  for (let INDEX = 1; INDEX <= 600; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    MESSAGE_IDS[`ID_${INDEX}`] = `20202020-${HEX_INDEX}-4e7c-8001-123456789bcd`;
  }

  return MESSAGE_IDS;
};

export const MESSAGE_DATA_SEED_IDS = GENERATE_MESSAGE_IDS();

const EMAIL_TEMPLATES = [
  {
    subject: 'Meeting Request',
    text: 'Hello,\n\nI hope this email finds you well. I am writing to request a meeting. I believe it would be beneficial for both parties to collaborate and explore potential opportunities.\n\nWould you be available for a meeting sometime next week? Please let me know your availability, and I will arrange a suitable time.\n\nLooking forward to your response.\n\nBest regards',
  },
  {
    subject: 'Project Update',
    text: 'Hi there,\n\nI wanted to provide you with a quick update on our current project status. We have made significant progress and are on track to meet our deadline.\n\nKey accomplishments this week:\n- Completed the initial design phase\n- Gathered stakeholder feedback\n- Finalized technical requirements\n\nNext steps will be shared in our upcoming meeting.\n\nBest regards',
  },
  {
    subject: 'Invoice for Services',
    text: "Dear Sir/Madam,\n\nPlease find attached the invoice for services rendered during the month of January. The total amount due is $2,500.\n\nPayment terms: Net 30 days\nPayment methods: Bank transfer or check\n\nIf you have any questions regarding this invoice, please don't hesitate to contact me.\n\nThank you for your business.\n\nBest regards",
  },
  {
    subject: 'Thank You for the Meeting',
    text: 'Good evening,\n\nI wanted to extend my sincere gratitude for taking the time to meet with me earlier today. It was a pleasure discussing our potential collaboration.\n\nI am excited about the opportunities we discussed and look forward to moving forward with our partnership.\n\nPlease feel free to reach out if you have any further questions or require additional information.\n\nBest regards',
  },
  {
    subject: 'Proposal Submission',
    text: 'Dear Team,\n\nI am pleased to submit our proposal for your consideration. We have carefully reviewed your requirements and believe we can deliver exceptional results.\n\nOur proposal includes:\n- Detailed project timeline\n- Resource allocation plan\n- Budget breakdown\n- Risk mitigation strategies\n\nWe would welcome the opportunity to discuss this proposal in detail.\n\nThank you for considering our services.\n\nBest regards',
  },
  {
    subject: 'Follow-up on Discussion',
    text: "Hi,\n\nI wanted to follow up on our conversation from last week regarding the new initiative. I've had some time to think about the points we discussed.\n\nI believe we should proceed with the plan we outlined, but I would like to suggest a few modifications to improve efficiency.\n\nCould we schedule a brief call to discuss these changes? I'm available most afternoons this week.\n\nThanks for your time.\n\nBest regards",
  },
  {
    subject: 'Customer Feedback',
    text: "Hello,\n\nI hope you're doing well. I wanted to share some positive feedback we received from our recent customer satisfaction survey.\n\nCustomers particularly appreciated:\n- Quick response times\n- Professional service delivery\n- Attention to detail\n- Clear communication\n\nThis reflects well on our team's dedication to excellence.\n\nKeep up the great work!\n\nBest regards",
  },
  {
    subject: 'Training Session Reminder',
    text: 'Dear Team,\n\nThis is a friendly reminder about the upcoming training session scheduled for [Date] at [Time].\n\nSession details:\n- Topic: [Training Topic]\n- Duration: 2 hours\n- Location: Conference Room A\n- Materials: Will be provided\n\nPlease confirm your attendance by replying to this email.\n\nLooking forward to seeing everyone there.\n\nBest regards',
  },
  {
    subject: 'Contract Renewal',
    text: 'Dear [Name],\n\nI hope this email finds you well. Your current contract with us is set to expire on [Date], and we would like to discuss renewal options.\n\nWe value our partnership and would be pleased to continue our collaboration. We have prepared several renewal packages that offer enhanced services and competitive pricing.\n\nWould you be available for a call next week to discuss the details?\n\nBest regards',
  },
  {
    subject: 'Quarterly Report',
    text: 'Good morning,\n\nPlease find attached our quarterly report covering the period from [Start Date] to [End Date].\n\nKey highlights:\n- Revenue growth of 15%\n- Customer satisfaction score of 4.8/5\n- Successful completion of 95% of projects\n- Team expansion by 20%\n\nWe are pleased with these results and look forward to continued success.\n\nIf you have any questions about the report, please let me know.\n\nBest regards',
  },
  {
    subject: 'Partnership Opportunity',
    text: 'Hello,\n\nI am reaching out to explore a potential partnership opportunity between our organizations. We believe there are synergies that could benefit both parties.\n\nOur company specializes in [Area of Expertise] and we have identified opportunities where our services could complement your offerings.\n\nWould you be interested in discussing this further? I would be happy to schedule a call at your convenience.\n\nBest regards',
  },
  {
    subject: 'Event Invitation',
    text: "Dear [Name],\n\nYou are cordially invited to attend our upcoming event:\n\nEvent: [Event Name]\nDate: [Date]\nTime: [Time]\nLocation: [Venue]\n\nThis event will feature industry experts discussing the latest trends and innovations in our field. It's an excellent opportunity for networking and learning.\n\nPlease RSVP by [RSVP Date] to secure your spot.\n\nWe look forward to seeing you there.\n\nBest regards",
  },
];

const GENERATE_MESSAGE_SEEDS = (): MessageDataSeed[] => {
  const MESSAGE_SEEDS: MessageDataSeed[] = [];

  const THREAD_IDS = Object.keys(MESSAGE_THREAD_DATA_SEED_IDS).map(
    (key) =>
      MESSAGE_THREAD_DATA_SEED_IDS[
        key as keyof typeof MESSAGE_THREAD_DATA_SEED_IDS
      ],
  );

  for (let INDEX = 1; INDEX <= 600; INDEX++) {
    const TEMPLATE_INDEX = (INDEX - 1) % EMAIL_TEMPLATES.length;
    const TEMPLATE = EMAIL_TEMPLATES[TEMPLATE_INDEX];

    // Assign messages to threads (some threads will have multiple messages)
    const THREAD_INDEX = Math.floor((INDEX - 1) / 2); // 2 messages per thread on average
    const THREAD_ID = THREAD_IDS[THREAD_INDEX % THREAD_IDS.length];

    const NOW = new Date();
    const RANDOM_DAYS_OFFSET = Math.floor(Math.random() * 90);
    const MESSAGE_DATE = new Date(
      NOW.getTime() - RANDOM_DAYS_OFFSET * 24 * 60 * 60 * 1000,
    );

    MESSAGE_DATE.setHours(
      8 + Math.floor(Math.random() * 10), // 8 AM to 6 PM
      Math.floor(Math.random() * 60), // Random minutes
      0,
      0,
    );

    MESSAGE_SEEDS.push({
      id: MESSAGE_DATA_SEED_IDS[`ID_${INDEX}`],
      createdAt: MESSAGE_DATE,
      updatedAt: MESSAGE_DATE,
      deletedAt: null,
      receivedAt: MESSAGE_DATE,
      text: TEMPLATE.text,
      subject: TEMPLATE.subject,
      messageThreadId: THREAD_ID,
      headerMessageId: `${INDEX.toString(16).padStart(8, '0')}-${MESSAGE_DATE.getTime().toString(16)}`,
    });
  }

  return MESSAGE_SEEDS;
};

export const MESSAGE_DATA_SEEDS = GENERATE_MESSAGE_SEEDS();
