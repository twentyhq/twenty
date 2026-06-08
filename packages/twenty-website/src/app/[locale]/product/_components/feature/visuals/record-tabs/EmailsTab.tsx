'use client';

import { styled } from '@linaria/react';
import {
  IconChevronLeft,
  IconLock,
  IconPaperclip,
  IconPlus,
} from '@tabler/icons-react';
import { useState } from 'react';

import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';

import {
  BG_DARK,
  BG_PANEL,
  BORDER_LIGHT,
  CARD_BORDER,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
  TEXT_LIGHT,
} from '../visual-tokens';

const InboxHeader = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 14px 16px 10px;
`;

const InboxTitleWrap = styled.div`
  align-items: baseline;
  display: flex;
  gap: 6px;
`;

const InboxTitle = styled.span`
  color: ${CARD_TEXT};
  font-size: 14px;
  font-weight: 600;
`;

const InboxCount = styled.span`
  color: ${TEXT_LIGHT};
  font-size: 14px;
`;

const ComposeBtn = styled.span`
  align-items: center;
  border: 1px solid ${CARD_BORDER};
  border-radius: 6px;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;
  font-size: 11px;
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

  &[data-clickable='true'] {
    cursor: pointer;
  }

  &[data-clickable='true']:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`;

const Heading = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  max-width: 118px;
  overflow: hidden;
`;

const Avatars = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  border: 1.5px solid ${BG_DARK};
  border-radius: 999px;
  height: 19px;
  object-fit: cover;
  width: 19px;

  & + & {
    margin-left: -5px;
  }
`;

const SenderNames = styled.span`
  color: ${CARD_TEXT};
  font-size: 12px;
  margin: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ThreadCount = styled.span`
  color: ${CARD_TEXT_TERTIARY};
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
  color: ${CARD_TEXT};
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BodyPreview = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  flex: 1;
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NotShared = styled.span`
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${BORDER_LIGHT};
  border-radius: 4px;
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;
  flex-shrink: 0;
  font-size: 11px;
  gap: 4px;
  min-width: 78px;
  padding: 1px 6px;

  svg {
    height: 12px;
    width: 12px;
  }
`;

const ReceivedAt = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  flex-shrink: 0;
  font-size: 11px;
  padding: 0 4px;
  white-space: nowrap;
`;

const AttachIcon = styled.span`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;
  flex-shrink: 0;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const DetailHeader = styled.div`
  align-items: center;
  background: ${BG_PANEL};
  border-bottom: 1px solid ${CARD_BORDER};
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  padding: 12px 14px;
`;

const BackBtn = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${CARD_TEXT_SECONDARY};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  padding: 0;

  svg {
    height: 16px;
    width: 16px;
  }
`;

const DetailSubject = styled.span`
  color: ${CARD_TEXT};
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MessageList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 0 14px;
`;

const Message = styled.div`
  border-bottom: 1px solid ${BORDER_LIGHT};
  padding: 12px 0;

  &:last-child {
    border-bottom: none;
  }
`;

const MsgHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const MsgSender = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
`;

const MsgAvatar = styled.img`
  border-radius: 999px;
  height: 18px;
  object-fit: cover;
  width: 18px;
`;

const MsgSenderName = styled.span`
  color: ${CARD_TEXT};
  font-size: 12px;
  font-weight: 500;
`;

const MsgDate = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 11px;
`;

const MsgBody = styled.p`
  color: ${CARD_TEXT_SECONDARY};
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
`;

type ThreadMessage = {
  sender: string;
  avatar: string;
  date: string;
  body: string;
};

type Email = {
  avatars: string[];
  sender: string;
  count: number;
  subject?: string;
  preview?: string;
  attachment?: boolean;
  date: string;
  thread?: ThreadMessage[];
};

const EMAILS: Email[] = [
  {
    avatars: [SHARED_PEOPLE_AVATAR_URLS.alexandreProt],
    sender: 'Alexandre',
    count: 2,
    date: '1:30pm',
  },
  {
    avatars: [
      SHARED_PEOPLE_AVATAR_URLS.anonymousFelix,
      SHARED_PEOPLE_AVATAR_URLS.anonymousLaura,
    ],
    sender: 'Félix',
    count: 4,
    subject: 'Partnerships',
    preview: "Hey team, I've been in touch with Notion and…",
    attachment: true,
    date: '4 nov 2023',
    thread: [
      {
        sender: 'Félix',
        avatar: SHARED_PEOPLE_AVATAR_URLS.anonymousFelix,
        date: '2 nov',
        body: "Hey team, I've been in touch with Notion and Figma about potential integrations. Both are open to co-marketing in Q4.",
      },
      {
        sender: 'Marie',
        avatar: SHARED_PEOPLE_AVATAR_URLS.anonymousLaura,
        date: '3 nov',
        body: 'Great news! I can draft the partnership brief by Friday. Should we loop in product for the Notion integration?',
      },
      {
        sender: 'Félix',
        avatar: SHARED_PEOPLE_AVATAR_URLS.anonymousFelix,
        date: '4 nov',
        body: "Yes, let's set up a call next Tuesday. I'll send calendar invites. Attaching the proposal deck for review.",
      },
    ],
  },
];

export function EmailsTab() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const openEmail = openIndex !== null ? EMAILS[openIndex] : null;

  if (openEmail?.thread) {
    return (
      <>
        <DetailHeader>
          <BackBtn
            aria-label="Back to inbox"
            onClick={() => setOpenIndex(null)}
          >
            <IconChevronLeft />
          </BackBtn>
          <DetailSubject>{openEmail.subject}</DetailSubject>
        </DetailHeader>
        <MessageList>
          {openEmail.thread.map((message, index) => (
            <Message key={index}>
              <MsgHeader>
                <MsgSender>
                  <MsgAvatar alt="" src={message.avatar} />
                  <MsgSenderName>{message.sender}</MsgSenderName>
                </MsgSender>
                <MsgDate>{message.date}</MsgDate>
              </MsgHeader>
              <MsgBody>{message.body}</MsgBody>
            </Message>
          ))}
        </MessageList>
      </>
    );
  }

  return (
    <>
      <InboxHeader>
        <InboxTitleWrap>
          <InboxTitle>Inbox</InboxTitle>
          <InboxCount>{EMAILS.length}</InboxCount>
        </InboxTitleWrap>
        <ComposeBtn>
          <IconPlus />
          Compose
        </ComposeBtn>
      </InboxHeader>
      <EmailList>
        {EMAILS.map((email, index) => {
          const canOpen = Boolean(email.subject && email.thread);
          return (
            <EmailRow
              data-clickable={canOpen}
              key={`${email.sender}-${email.date}`}
              onClick={canOpen ? () => setOpenIndex(index) : undefined}
              onKeyDown={
                canOpen
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setOpenIndex(index);
                      }
                    }
                  : undefined
              }
              role={canOpen ? 'button' : undefined}
              tabIndex={canOpen ? 0 : undefined}
            >
              <Heading>
                <Avatars>
                  {email.avatars.map((url, avatarIndex) => (
                    <Avatar alt="" key={avatarIndex} src={url} />
                  ))}
                </Avatars>
                <SenderNames>{email.sender}</SenderNames>
                <ThreadCount>{email.count}</ThreadCount>
              </Heading>
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
          );
        })}
      </EmailList>
    </>
  );
}
