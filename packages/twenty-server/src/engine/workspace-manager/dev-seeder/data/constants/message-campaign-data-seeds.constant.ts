import { MessageCampaignStatus } from 'twenty-shared/types';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import { getSeededEmailGroupDomains } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-emailing-domains.util';
import { getSeededUnsubscribeTopicIds } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-unsubscribe-topics.util';
import { MESSAGE_LIST_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-list-data-seeds.constant';
import { countMessageListMembers } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-list-member-data-seeds.constant';

type MessageCampaignDataSeed = {
  id: string;
  position: number;
  name: string;
  subject: string;
  bodyTemplate: string;
  fromAddressPrimaryEmail: string;
  listId: string;
  unsubscribeTopicId: string;
  status: MessageCampaignStatus;
  sentAt: string | null;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  skippedCount: number;
  bouncedCount: number;
  complainedCount: number;
};

export const MESSAGE_CAMPAIGN_DATA_SEED_COLUMNS: (keyof MessageCampaignDataSeed)[] =
  [
    'id',
    'position',
    'name',
    'subject',
    'bodyTemplate',
    'fromAddressPrimaryEmail',
    'listId',
    'unsubscribeTopicId',
    'status',
    'sentAt',
    'sentCount',
    'deliveredCount',
    'failedCount',
    'skippedCount',
    'bouncedCount',
    'complainedCount',
  ];

export const MESSAGE_CAMPAIGN_DATA_SEED_IDS = {
  PRODUCT_LAUNCH: '20202020-342c-4f7a-8c7e-37e2bc291101',
  FOUNDER_DIGEST: '20202020-342c-4f7a-8c7e-37e2bc291102',
};

const FOUNDER_DIGEST_AUDIENCE_SIZE = countMessageListMembers(
  MESSAGE_LIST_DATA_SEED_IDS.FOUNDERS,
);
const FOUNDER_DIGEST_SKIPPED_COUNT = 1;
const FOUNDER_DIGEST_FAILED_COUNT = 1;
const FOUNDER_DIGEST_BOUNCED_COUNT = 1;
const FOUNDER_DIGEST_SENT_COUNT =
  FOUNDER_DIGEST_AUDIENCE_SIZE -
  FOUNDER_DIGEST_SKIPPED_COUNT -
  FOUNDER_DIGEST_FAILED_COUNT;

const createEmailBodyTemplate = ({
  headline,
  introduction,
  highlights,
  callToAction,
}: {
  headline: string;
  introduction: string;
  highlights: string[];
  callToAction: { label: string; href: string };
}) =>
  JSON.stringify({
    type: 'doc',
    attrs: {
      schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION,
      canvasTheme: {
        pageBackground: '#F5F5F7',
        bodyBackground: '#FFFFFF',
        textColor: '#1D1D1F',
        width: '640px',
        padding: '48px',
        cornerRadius: '20px',
      },
    },
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: headline }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: introduction }],
      },
      {
        type: 'bulletList',
        content: highlights.map((highlight) => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: highlight }],
            },
          ],
        })),
      },
      {
        type: 'button',
        attrs: {
          href: callToAction.href,
          style: { backgroundColor: '#0071E3', color: '#FFFFFF' },
        },
        content: [{ type: 'text', text: callToAction.label }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'The Apple Developer Relations team' }],
      },
    ],
  });

// The sender is the seeded email group on the workspace's verified domain, so
// the draft can actually be sent from a freshly seeded workspace.
export const getMessageCampaignDataSeeds = (
  workspaceId: string,
): MessageCampaignDataSeed[] => {
  const fromAddress = `support@${getSeededEmailGroupDomains(workspaceId).verified}`;
  const unsubscribeTopicIds = getSeededUnsubscribeTopicIds(workspaceId);

  return [
    {
      id: MESSAGE_CAMPAIGN_DATA_SEED_IDS.PRODUCT_LAUNCH,
      position: 0,
      name: 'Vision Pro developer launch',
      subject: 'Build what comes next with Apple Vision Pro',
      bodyTemplate: createEmailBodyTemplate({
        headline: 'A new canvas for your ideas.',
        introduction:
          'Apple Vision Pro brings your apps into an infinite spatial canvas. Explore the tools designed to help you create remarkable experiences from day one.',
        highlights: [
          'Design immersive interfaces with visionOS and SwiftUI.',
          'Preview spatial experiences using the latest Xcode tools.',
          'Learn directly from Apple engineers in upcoming labs.',
        ],
        callToAction: {
          label: 'Start building',
          href: 'https://developer.apple.com/visionos/',
        },
      }),
      fromAddressPrimaryEmail: fromAddress,
      listId: MESSAGE_LIST_DATA_SEED_IDS.DEVELOPER_PROGRAM,
      unsubscribeTopicId:
        unsubscribeTopicIds['unsubscribe-topic-product-updates'],
      status: MessageCampaignStatus.DRAFT,
      sentAt: null,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      skippedCount: 0,
      bouncedCount: 0,
      complainedCount: 0,
    },
    {
      id: MESSAGE_CAMPAIGN_DATA_SEED_IDS.FOUNDER_DIGEST,
      position: 1,
      name: 'June founder digest',
      subject: "The tools behind this month's standout apps",
      bodyTemplate: createEmailBodyTemplate({
        headline: 'Big ideas, beautifully built.',
        introduction:
          'This month, founders across the community shipped faster, reached new customers, and turned ambitious ideas into delightful products.',
        highlights: [
          'Meet three teams rethinking health, focus, and collaboration.',
          'See how App Intents can make everyday actions effortless.',
          'Save your seat for our live founder Q&A.',
        ],
        callToAction: {
          label: 'Read the stories',
          href: 'https://developer.apple.com/news/',
        },
      }),
      fromAddressPrimaryEmail: fromAddress,
      listId: MESSAGE_LIST_DATA_SEED_IDS.FOUNDERS,
      unsubscribeTopicId: unsubscribeTopicIds['unsubscribe-topic-newsletter'],
      status: MessageCampaignStatus.SENT,
      sentAt: '2026-06-18T15:00:00.000Z',
      sentCount: FOUNDER_DIGEST_SENT_COUNT,
      deliveredCount: FOUNDER_DIGEST_SENT_COUNT - FOUNDER_DIGEST_BOUNCED_COUNT,
      failedCount: FOUNDER_DIGEST_FAILED_COUNT,
      skippedCount: FOUNDER_DIGEST_SKIPPED_COUNT,
      bouncedCount: FOUNDER_DIGEST_BOUNCED_COUNT,
      complainedCount: 0,
    },
  ];
};
