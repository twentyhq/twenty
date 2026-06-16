import { styled } from '@linaria/react';
import {
  IconCalendarEvent,
  IconCheckbox,
  IconLock,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconPlus,
  IconTimelineEvent,
} from '@tabler/icons-react';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';
import { PRODUCT_FEATURE_PALETTE } from '@/tokens/feature-scenes/product-feature-palette';

const palette = PRODUCT_FEATURE_PALETTE;
const avatars = sharedAssetUrls.peopleAvatars;

// The product's six record tabs. Only Emails is active here — the others are
// context (this visual owns its own tab content, nothing else).
const RECORD_TABS = [
  { icon: IconTimelineEvent, label: 'Timeline' },
  { icon: IconCheckbox, label: 'Tasks' },
  { icon: IconNotes, label: 'Notes' },
  { icon: IconPaperclip, label: 'Files' },
  { icon: IconMail, label: 'Emails' },
  { icon: IconCalendarEvent, label: 'Calendar' },
];

const ACTIVE_TAB = 'Emails';

type Email = {
  attachment?: boolean;
  avatars: string[];
  date: string;
  preview?: string;
  sender: string;
  subject?: string;
  threadCount: number;
};

const EMAILS: Email[] = [
  {
    attachment: true,
    avatars: [avatars.anonymousMike, avatars.anonymousLaura],
    date: 'Nov 4',
    preview: 'Both Notion and Figma are open to co-marketing…',
    sender: 'Mike',
    subject: 'Partnerships',
    threadCount: 4,
  },
  {
    avatars: [avatars.darioAmodei],
    date: '1:30pm',
    sender: 'Dario',
    threadCount: 2,
  },
  {
    avatars: [avatars.patrickCollison],
    date: 'Oct 28',
    preview: 'Sending over the annual quote we discussed.',
    sender: 'Patrick',
    subject: 'Pricing follow-up',
    threadCount: 1,
  },
  {
    attachment: true,
    avatars: [avatars.stewartButterfield, avatars.anonymousLaura],
    date: 'Oct 24',
    preview: "Looping in the team for next week's kickoff.",
    sender: 'Stewart',
    subject: 'Onboarding kickoff',
    threadCount: 3,
  },
  {
    avatars: [avatars.dylanField],
    date: 'Oct 20',
    sender: 'Dylan',
    threadCount: 1,
  },
];

const Root = styled.div`
  background-color: ${palette.background};
  display: flex;
  flex-direction: column;
  font-family: ${palette.font};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const TabBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${palette.borderLight};
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 0 12px;
`;

const Tab = styled.span`
  align-items: center;
  color: ${palette.textSecondary};
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 5px;
  padding: 11px 8px;
  white-space: nowrap;

  svg {
    height: 15px;
    width: 15px;
  }

  &[data-active] {
    box-shadow: inset 0 -1px 0 ${palette.textPrimary};
    color: ${palette.textPrimary};
  }
`;

const InboxHeader = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 14px 16px 12px;
`;

const InboxTitleWrap = styled.div`
  align-items: baseline;
  display: flex;
  gap: 6px;
`;

const InboxTitle = styled.span`
  color: ${palette.textPrimary};
  font-size: 13px;
  font-weight: 600;
`;

const InboxCount = styled.span`
  color: ${palette.textLight};
  font-size: 13px;
`;

const ComposeButton = styled.span`
  align-items: center;
  border: 1px solid ${palette.border};
  border-radius: 6px;
  color: ${palette.textSecondary};
  display: inline-flex;
  font-size: 11px;
  font-weight: 500;
  gap: 4px;
  padding: 4px 8px;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const EmailList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 0 8px;
`;

const EmailRow = styled.div`
  align-items: center;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  height: 44px;
  padding: 0 8px;

  &:hover {
    background-color: ${palette.rowHoverBackground};
  }
`;

const SenderCell = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  max-width: 118px;
  overflow: hidden;
`;

const AvatarStack = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  border: 1.5px solid ${palette.background};
  border-radius: 999px;
  height: 19px;
  object-fit: cover;
  width: 19px;

  & + & {
    margin-left: -5px;
  }
`;

const SenderName = styled.span`
  color: ${palette.textPrimary};
  font-size: 12px;
  margin: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ThreadCount = styled.span`
  color: ${palette.textTertiary};
  flex-shrink: 0;
  font-size: 11px;
`;

const SubjectAndBody = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
`;

const Subject = styled.span`
  color: ${palette.textPrimary};
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BodyPreview = styled.span`
  color: ${palette.textTertiary};
  flex: 1;
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NotShared = styled.span`
  align-items: center;
  background-color: ${palette.sunkenBackground};
  border: 1px solid ${palette.border};
  border-radius: 4px;
  color: ${palette.textTertiary};
  display: inline-flex;
  flex-shrink: 0;
  font-size: 11px;
  gap: 4px;
  padding: 1px 6px;

  svg {
    height: 12px;
    width: 12px;
  }
`;

const AttachIcon = styled.span`
  align-items: center;
  color: ${palette.textTertiary};
  display: inline-flex;
  flex-shrink: 0;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const ReceivedAt = styled.span`
  color: ${palette.textTertiary};
  flex-shrink: 0;
  font-size: 11px;
  padding: 0 4px;
  white-space: nowrap;
`;

// A record's Emails tab — the tab bar (Emails active) over the inbox: each
// thread shows its participants, subject and preview (or a "Not shared" lock
// when the message stays private), with attachment and received-at markers.
export function EmailsVisual() {
  return (
    <Root>
      <TabBar>
        {RECORD_TABS.map((recordTab) => {
          const TabIcon = recordTab.icon;
          return (
            <Tab
              data-active={recordTab.label === ACTIVE_TAB ? '' : undefined}
              key={recordTab.label}
            >
              <TabIcon />
              {recordTab.label}
            </Tab>
          );
        })}
      </TabBar>
      <InboxHeader>
        <InboxTitleWrap>
          <InboxTitle>Inbox</InboxTitle>
          <InboxCount>{EMAILS.length}</InboxCount>
        </InboxTitleWrap>
        <ComposeButton>
          <IconPlus />
          Compose
        </ComposeButton>
      </InboxHeader>
      <EmailList>
        {EMAILS.map((email) => (
          <EmailRow key={`${email.sender}-${email.date}`}>
            <SenderCell>
              <AvatarStack>
                {email.avatars.map((url) => (
                  <Avatar
                    alt=""
                    fetchPriority="low"
                    key={url}
                    loading="lazy"
                    src={url}
                  />
                ))}
              </AvatarStack>
              <SenderName>{email.sender}</SenderName>
              <ThreadCount>{email.threadCount}</ThreadCount>
            </SenderCell>
            <SubjectAndBody>
              {email.subject ? (
                <>
                  <Subject>{email.subject}</Subject>
                  {email.preview ? (
                    <BodyPreview>{email.preview}</BodyPreview>
                  ) : null}
                </>
              ) : (
                <NotShared>
                  <IconLock />
                  Not shared
                </NotShared>
              )}
            </SubjectAndBody>
            {email.attachment ? (
              <AttachIcon>
                <IconPaperclip />
              </AttachIcon>
            ) : null}
            <ReceivedAt>{email.date}</ReceivedAt>
          </EmailRow>
        ))}
      </EmailList>
    </Root>
  );
}
