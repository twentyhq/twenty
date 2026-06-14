'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useState } from 'react';

import { PRODUCT_FEATURE_SCENE } from '@/tokens/feature-scenes/product-feature-scene';

const scene = PRODUCT_FEATURE_SCENE.activity;

const Root = styled.div`
  background-color: ${scene.background};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const TabBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${scene.tabLine};
  display: flex;
  gap: 0;
  padding: 0 12px;
`;

const Tab = styled.span`
  align-items: center;
  color: ${scene.inkFaint};
  display: flex;
  font-size: 10.5px;
  font-weight: 500;
  gap: 4px;
  padding: 9px 10px;
  white-space: nowrap;

  &[data-active] {
    border-bottom: 1.5px solid ${scene.inkStrong};
    color: ${scene.inkStrong};
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
  border-bottom: 1px solid ${scene.line};
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
  color: ${scene.ink};
  font-size: 11.5px;
  font-weight: 600;
`;

const InboxCount = styled.span`
  color: ${scene.inkFaint};
  font-size: 11px;
`;

const ComposeButton = styled.button`
  background: none;
  border: 1px solid ${scene.buttonBorder};
  border-radius: 3px;
  color: ${scene.inkSoft};
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  padding: 3px 8px;
  transition: border-color 0.12s ease;

  &:hover {
    border-color: ${scene.buttonBorderHover};
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
    background-color: ${scene.rowHoverWash};
  }
`;

const AvatarSingle = styled.div<{ $ink: string }>`
  align-items: center;
  background-color: ${({ $ink }) => $ink};
  border-radius: 50%;
  color: ${scene.inkOnFill};
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

const StackedAvatar = styled.div<{ $ink: string }>`
  align-items: center;
  background-color: ${({ $ink }) => $ink};
  border: 1.5px solid ${scene.background};
  border-radius: 50%;
  color: ${scene.inkOnFill};
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
  color: ${scene.inkStrong};
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 500;
`;

const SenderCount = styled.span`
  color: ${scene.inkGhost};
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
  color: ${scene.inkBody};
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
`;

const PreviewText = styled.span`
  color: ${scene.inkGhost};
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmailMeta = styled.div`
  align-items: center;
  color: ${scene.inkDim};
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

// The window's mini tab glyphs (authored scene artwork, verbatim — drawn
// at this window's smaller scale, distinct from the tasks window's set).
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

const ACTIVE_TAB_NUMBER = 4;

const DetailHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${scene.line};
  display: flex;
  gap: 8px;
  padding: 8px 14px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${scene.inkDetail};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  padding: 2px;

  &:hover {
    color: ${scene.inkBody};
  }
`;

const DetailSubject = styled.span`
  color: ${scene.ink};
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
  color: ${scene.inkStrong};
  font-size: 11px;
  font-weight: 500;
`;

const DetailTime = styled.span`
  color: ${scene.inkDim};
  font-size: 10px;
  margin-left: auto;
`;

const DetailContent = styled.p`
  color: ${scene.inkDetail};
  font-size: 11px;
  line-height: 1.6;
`;

const ThreadMessage = styled.div`
  border-left: 2px solid ${scene.line};
  padding-left: 10px;
`;

type ThreadEntry = {
  body: string;
  ink: string;
  sender: string;
  time: string;
};

// Mock fiction threads (product-screenshot copy, English). The inbox
// rows above are authored chrome; only the opened detail reads this.
const EMAILS_DATA: { subject: string; thread: ThreadEntry[] }[] = [
  {
    subject: 'NDA Document - Private',
    thread: [
      {
        sender: 'Alexandre',
        ink: scene.avatarInks.indigo,
        time: '1:30pm',
        body: 'Hi, please find the NDA attached for your review. This is confidential and not shared with external parties yet. Let me know once signed so I can countersign.',
      },
    ],
  },
  {
    subject: 'Partnerships - Q4 Strategy',
    thread: [
      {
        sender: 'Félix',
        ink: scene.avatarInks.amber,
        time: '2 nov',
        body: "Hey team, I've been in touch with Notion and Figma about potential integrations. Both are open to co-marketing in Q4.",
      },
      {
        sender: 'Marie',
        ink: scene.avatarInks.violet,
        time: '3 nov',
        body: 'Great news! I can draft the partnership brief by Friday. Should we loop in product for the Notion integration?',
      },
      {
        sender: 'Félix',
        ink: scene.avatarInks.amber,
        time: '4 nov',
        body: "Yes, let's set up a call next Tuesday. I'll send calendar invites. Attaching the proposal deck for review.",
      },
    ],
  },
];

function EmailDetail({
  emailNumber,
  onBack,
}: {
  emailNumber: number;
  onBack: () => void;
}) {
  const { i18n } = useLingui();
  const email = EMAILS_DATA[emailNumber];
  const thread = email.thread.map((message, messageNumber) => ({
    message,
    messageNumber,
  }));

  return (
    <>
      <DetailHeader>
        <BackButton aria-label={i18n._(msg`Back to inbox`)} onClick={onBack}>
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
        {thread.map(({ message, messageNumber }) => (
          <ThreadMessage key={messageNumber}>
            <DetailSenderRow>
              <AvatarSingle $ink={message.ink}>
                {message.sender[0]}
              </AvatarSingle>
              <DetailSenderName>{message.sender}</DetailSenderName>
              <DetailTime>{message.time}</DetailTime>
            </DetailSenderRow>
            <DetailContent>{message.body}</DetailContent>
          </ThreadMessage>
        ))}
      </DetailBody>
    </>
  );
}

export function EmailsVisual({ active: _active }: { active: boolean }) {
  const [openEmail, setOpenEmail] = useState<number | null>(null);

  const openOnKey = (emailNumber: number) =>
    ((event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpenEmail(emailNumber);
      }
    }) as React.KeyboardEventHandler<HTMLDivElement>;

  return (
    <Root>
      <TabBar>
        {TAB_PATHS.map((tab, tabNumber) => (
          <Tab
            data-active={tabNumber === ACTIVE_TAB_NUMBER ? '' : undefined}
            key={tab.label}
          >
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
              onClick={() => setOpenEmail(0)}
              onKeyDown={openOnKey(0)}
              role="button"
              tabIndex={0}
            >
              <AvatarSingle $ink={scene.avatarInks.indigo}>A</AvatarSingle>
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
              onClick={() => setOpenEmail(1)}
              onKeyDown={openOnKey(1)}
              role="button"
              tabIndex={0}
            >
              <AvatarStack>
                <StackedAvatar $ink={scene.avatarInks.amber}>F</StackedAvatar>
                <StackedAvatar $ink={scene.avatarInks.violet}>M</StackedAvatar>
                <StackedAvatar $ink={scene.avatarInks.cyan}>K</StackedAvatar>
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
        <EmailDetail
          emailNumber={openEmail}
          onBack={() => setOpenEmail(null)}
        />
      )}
    </Root>
  );
}
