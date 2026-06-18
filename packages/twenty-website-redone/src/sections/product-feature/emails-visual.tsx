'use client';

import { styled } from '@linaria/react';
import { IconLock, IconPlus } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';
import { PersonAvatar } from '@/app-preview/primitives/PersonAvatar';
import { previewFontSize } from '@/app-preview/preview-font-size';

import { RecordTabHeader } from './record-tab-header';

const PEOPLE = sharedAssetUrls.peopleAvatars;

type Participant = {
  avatarUrl: string;
  name: string;
};

type EmailThread = {
  date: string;
  messageCount: number;
  participants: Participant[];
  preview?: string;
  shared: boolean;
  subject?: string;
};

// The record's two email threads (product-screenshot copy, English). The NDA
// thread stays private — only its metadata is shared, so twenty-front shows the
// "Not shared" lock instead of the subject and body.
const THREADS: EmailThread[] = [
  {
    date: '1:30pm',
    messageCount: 2,
    participants: [{ avatarUrl: PEOPLE.anonymousMike, name: 'Mike' }],
    shared: false,
  },
  {
    date: '4 nov 2023',
    messageCount: 4,
    participants: [
      { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix' },
      { avatarUrl: PEOPLE.anonymousThomas, name: 'Thomas' },
    ],
    preview:
      "Hey team, I've been in touch with Notion and Figma about potential integrations.",
    shared: true,
    subject: 'Partnerships - Q4 Strategy',
  },
];

const Root = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: ${THEME_LIGHT.font.family};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Panel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding-top: 8px;
`;

const InboxHeader = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 8px 16px 12px;
`;

const InboxTitle = styled.span`
  align-items: baseline;
  color: ${THEME_LIGHT.font.color.primary};
  display: flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  gap: 6px;
`;

const InboxCount = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  font-weight: ${THEME_LIGHT.font.weight.regular};
`;

const ComposeButton = styled.span`
  align-items: center;
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.secondary};
  display: inline-flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  gap: 4px;
  padding: 4px 8px;
`;

const ThreadList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const Row = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${THEME_LIGHT.font.color.primary};
  display: flex;
  gap: 8px;
  height: 48px;
  padding: 0 16px;

  &:hover {
    background-color: ${THEME_LIGHT.background.transparent.light};
  }
`;

const Heading = styled.div`
  align-items: center;
  display: flex;
  max-width: 40%;
  min-width: 0;
  overflow: hidden;
  width: fit-content;
`;

const AvatarStack = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;

  & > * + * {
    margin-left: -4px;
  }
`;

const SenderNames = styled.span`
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  margin: 0 4px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ThreadCount = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

const SubjectBody = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
`;

const Subject = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  flex-shrink: 0;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Preview = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  flex: 1;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NotShared = styled.span`
  align-items: center;
  background: ${THEME_LIGHT.background.transparent.lighter};
  border: 1px solid ${THEME_LIGHT.border.color.light};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.tertiary};
  display: inline-flex;
  flex: 1;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  gap: 4px;
  height: 20px;
  padding: 0 4px;
`;

const ReceivedAt = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  padding: 0 4px;
  white-space: nowrap;
`;

export function EmailsVisual({ active: _active }: { active: boolean }) {
  return (
    <Root>
      <RecordTabHeader active="Emails" />
      <Panel>
        <InboxHeader>
          <InboxTitle>
            Inbox
            <InboxCount>{THREADS.length}</InboxCount>
          </InboxTitle>
          <ComposeButton>
            <IconPlus size={12} stroke={2} />
            Compose
          </ComposeButton>
        </InboxHeader>
        <ThreadList>
          {THREADS.map((thread) => (
            <Row key={thread.participants[0].name}>
              <Heading>
                <AvatarStack>
                  {thread.participants.map((participant) => (
                    <PersonAvatar
                      key={participant.name}
                      person={{
                        avatarUrl: participant.avatarUrl,
                        name: participant.name,
                      }}
                      size={16}
                    />
                  ))}
                </AvatarStack>
                <SenderNames>
                  {thread.participants
                    .map((participant) => participant.name)
                    .join(', ')}
                </SenderNames>
                <ThreadCount>{thread.messageCount}</ThreadCount>
              </Heading>
              <SubjectBody>
                {thread.shared ? (
                  <>
                    <Subject>{thread.subject}</Subject>
                    <Preview>{thread.preview}</Preview>
                  </>
                ) : (
                  <NotShared>
                    <IconLock size={14} stroke={2} />
                    Not shared
                  </NotShared>
                )}
              </SubjectBody>
              <ReceivedAt>{thread.date}</ReceivedAt>
            </Row>
          ))}
        </ThreadList>
      </Panel>
    </Root>
  );
}
