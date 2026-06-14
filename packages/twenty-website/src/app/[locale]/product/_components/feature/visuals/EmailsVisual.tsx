'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

const Root = styled.div`
  background-color: #191920;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const TabBar = styled.div`
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 0;
  padding: 0 12px;
`;

const Tab = styled.span`
  align-items: center;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  font-size: 10.5px;
  font-weight: 500;
  gap: 4px;
  padding: 9px 10px;
  white-space: nowrap;

  &[data-active='true'] {
    border-bottom: 1.5px solid rgba(255, 255, 255, 0.85);
    color: rgba(255, 255, 255, 0.85);
  }
`;

const TabIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  height: 11px;
  width: 11px;
`;

const InboxHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-between;
  padding: 8px 14px;
`;

const InboxLeft = styled.div`
  align-items: baseline;
  display: flex;
  gap: 5px;
`;

const InboxTitle = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-size: 11.5px;
  font-weight: 600;
`;

const InboxCount = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
`;

const ComposeButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  padding: 3px 8px;
  transition: border-color 0.12s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const EmailList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const EmailRow = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 8px;
  padding: 8px 14px;
  transition: background-color 0.12s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }

  &[data-selected='true'] {
    background-color: rgba(255, 255, 255, 0.04);
  }
`;

const AvatarSingle = styled.div`
  align-items: center;
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 600;
  height: 18px;
  justify-content: center;
  width: 18px;
`;

const AvatarStack = styled.div`
  display: flex;
  flex-shrink: 0;
  width: 28px;
`;

const StackedAvatar = styled.div`
  align-items: center;
  border: 1.5px solid #191920;
  border-radius: 50%;
  color: #fff;
  display: flex;
  font-size: 6px;
  font-weight: 700;
  height: 16px;
  justify-content: center;
  margin-left: -5px;
  width: 16px;

  &:first-child {
    margin-left: 0;
  }
`;

const EmailBody = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
`;

const SenderName = styled.span`
  color: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 500;
`;

const SenderCount = styled.span`
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
  font-size: 10px;
`;

const PreviewIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  height: 10px;
  width: 10px;
`;

const SubjectBold = styled.span`
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
`;

const PreviewText = styled.span`
  color: rgba(255, 255, 255, 0.35);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmailMeta = styled.div`
  align-items: center;
  color: rgba(255, 255, 255, 0.3);
  display: flex;
  flex-shrink: 0;
  font-size: 10px;
  gap: 4px;
  padding-left: 8px;
  white-space: nowrap;
`;

const MetaIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  height: 10px;
  opacity: 0.5;
  width: 10px;
`;

const TAB_PATHS = [
  {
    label: 'Timeline',
    d: 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM8 4.5V8l2.5 1.5',
  },
  {
    label: 'Tasks',
    d: 'M5 3h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM6 8l1.5 1.5L10 7',
  },
  { label: 'Notes', d: 'M4 4h8M4 7h8M4 10h5' },
  {
    label: 'Files',
    d: 'M3 8.5a3 3 0 0 1 3-3h4.5a2 2 0 0 1 0 4H6.5a1 1 0 0 1 0-2H11',
  },
  {
    label: 'Emails',
    d: 'M2 5.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5zM2 5.5l6 4 6-4',
  },
  {
    label: 'Calendar',
    d: 'M5 3h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM3 7h10M6 2v2M10 2v2',
  },
];

const DetailHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  gap: 8px;
  padding: 8px 14px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  padding: 2px;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const DetailSubject = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-size: 11.5px;
  font-weight: 600;
`;

const DetailBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
`;

const DetailSenderRow = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`;

const DetailSenderName = styled.span`
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  font-weight: 500;
`;

const DetailTime = styled.span`
  color: rgba(255, 255, 255, 0.3);
  font-size: 10px;
  margin-left: auto;
`;

const DetailContent = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  line-height: 1.6;
  margin: 0;
`;

const EMAILS_DATA = [
  {
    sender: 'Alexandre',
    subject: 'NDA Document - Private',
    time: '1:30pm',
    color: '#6366f1',
    thread: [
      {
        sender: 'Alexandre',
        color: '#6366f1',
        time: '1:30pm',
        body: 'Hi, please find the NDA attached for your review. This is confidential and not shared with external parties yet. Let me know once signed so I can countersign.',
      },
    ],
  },
  {
    sender: 'Félix',
    subject: 'Partnerships - Q4 Strategy',
    time: '4 nov 2023',
    color: '#f59e0b',
    thread: [
      {
        sender: 'Félix',
        color: '#f59e0b',
        time: '2 nov',
        body: "Hey team, I've been in touch with Notion and Figma about potential integrations. Both are open to co-marketing in Q4.",
      },
      {
        sender: 'Marie',
        color: '#8b5cf6',
        time: '3 nov',
        body: 'Great news! I can draft the partnership brief by Friday. Should we loop in product for the Notion integration?',
      },
      {
        sender: 'Félix',
        color: '#f59e0b',
        time: '4 nov',
        body: "Yes, let's set up a call next Tuesday. I'll send calendar invites. Attaching the proposal deck for review.",
      },
    ],
  },
];

const ThreadMessage = styled.div`
  border-left: 2px solid rgba(255, 255, 255, 0.06);
  padding-left: 10px;
`;

function EmailDetail({
  emailIndex,
  onBack,
}: {
  emailIndex: number;
  onBack: () => void;
}) {
  const email = EMAILS_DATA[emailIndex];
  return (
    <>
      <DetailHeader>
        <BackButton aria-label="Back to inbox" onClick={onBack}>
          <svg
            fill="none"
            height="12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
            viewBox="0 0 12 12"
            width="12"
          >
            <path d="M7.5 2.5L4 6l3.5 3.5" />
          </svg>
        </BackButton>
        <DetailSubject>{email.subject}</DetailSubject>
      </DetailHeader>
      <DetailBody>
        {email.thread.map((msg, i) => (
          <ThreadMessage key={i}>
            <DetailSenderRow>
              <AvatarSingle style={{ backgroundColor: msg.color }}>
                {msg.sender[0]}
              </AvatarSingle>
              <DetailSenderName>{msg.sender}</DetailSenderName>
              <DetailTime>{msg.time}</DetailTime>
            </DetailSenderRow>
            <DetailContent>{msg.body}</DetailContent>
          </ThreadMessage>
        ))}
      </DetailBody>
    </>
  );
}

type EmailsVisualProps = {
  active: boolean;
};

export function EmailsVisual({ active: _active }: EmailsVisualProps) {
  const [openEmail, setOpenEmail] = useState<number | null>(null);

  return (
    <Root>
      <TabBar>
        {TAB_PATHS.map((tab, index) => (
          <Tab data-active={index === 4} key={tab.label}>
            <TabIcon>
              <svg
                fill="none"
                height="11"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
                viewBox="0 0 16 16"
                width="11"
              >
                <path d={tab.d} />
              </svg>
            </TabIcon>
            {tab.label}
          </Tab>
        ))}
      </TabBar>

      {openEmail === null ? (
        <>
          <InboxHeader>
            <InboxLeft>
              <InboxTitle>Inbox</InboxTitle>
              <InboxCount>2</InboxCount>
            </InboxLeft>
            <ComposeButton>+ Compose</ComposeButton>
          </InboxHeader>
          <EmailList>
            <EmailRow
              data-selected={false}
              onClick={() => setOpenEmail(0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenEmail(0);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <AvatarSingle style={{ backgroundColor: '#6366f1' }}>
                A
              </AvatarSingle>
              <EmailBody>
                <SenderName>Alexandre..</SenderName>
                <SenderCount>2</SenderCount>
                <PreviewIcon>
                  <svg
                    fill="none"
                    height="10"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    viewBox="0 0 12 12"
                    width="10"
                  >
                    <rect height="5" rx="1" width="6" x="3" y="5.5" />
                    <path d="M4.5 5.5V4a1.5 1.5 0 0 1 3 0v1.5" />
                  </svg>
                </PreviewIcon>
                <PreviewText>Not shared</PreviewText>
              </EmailBody>
              <EmailMeta>1:30pm</EmailMeta>
            </EmailRow>

            <EmailRow
              data-selected={false}
              onClick={() => setOpenEmail(1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenEmail(1);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <AvatarStack>
                <StackedAvatar style={{ backgroundColor: '#f59e0b' }}>
                  F
                </StackedAvatar>
                <StackedAvatar style={{ backgroundColor: '#8b5cf6' }}>
                  M
                </StackedAvatar>
                <StackedAvatar style={{ backgroundColor: '#06b6d4' }}>
                  K
                </StackedAvatar>
              </AvatarStack>
              <EmailBody>
                <SenderName>Félix..</SenderName>
                <SenderCount>4</SenderCount>
                <SubjectBold>Partnerships</SubjectBold>
                <PreviewText>
                  Hey team, I've been in touch with Notion and...
                </PreviewText>
              </EmailBody>
              <EmailMeta>
                <MetaIcon>
                  <svg
                    fill="none"
                    height="10"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    viewBox="0 0 12 12"
                    width="10"
                  >
                    <path d="M2.5 7a3 3 0 0 1 3-3H9a1.5 1.5 0 0 1 0 3H5.5a.75.75 0 0 1 0-1.5H9" />
                  </svg>
                </MetaIcon>
                <MetaIcon>
                  <svg
                    fill="none"
                    height="10"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    viewBox="0 0 12 12"
                    width="10"
                  >
                    <rect height="7" rx="1.5" width="8" x="2" y="3" />
                    <path d="M2 5.5h8M4.5 2v2M7.5 2v2" />
                  </svg>
                </MetaIcon>
                4 nov 2023
              </EmailMeta>
            </EmailRow>
          </EmailList>
        </>
      ) : (
        <EmailDetail onBack={() => setOpenEmail(null)} emailIndex={openEmail} />
      )}
    </Root>
  );
}
