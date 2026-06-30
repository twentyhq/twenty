'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';
import { PersonAvatar } from '@/app-preview/primitives/PersonAvatar';

import { type EmailThread } from '../types/email-thread';

const Row = styled.div`
  align-items: center;
  background-color: ${THEME_LIGHT.background.secondary};
  box-sizing: border-box;
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  gap: 8px;
  height: 48px;
  padding: 0 16px;

  &:hover {
    background-color: transparent;
  }
`;

const Sender = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 20%;
  min-width: 0;
  overflow: hidden;
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
  margin: 0 4px;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
`;

const MessageCount = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  flex-shrink: 0;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Preview = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ReceivedAt = styled.span`
  flex-shrink: 0;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  padding: 0 4px;
  white-space: nowrap;
`;

export function ThreadRow({ thread }: { thread: EmailThread }) {
  const { i18n } = useLingui();
  return (
    <Row>
      <Sender>
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
        <MessageCount>{thread.messageCount}</MessageCount>
      </Sender>
      <SubjectBody>
        <Subject>{i18n._(thread.subject)}</Subject>
        <Preview>{i18n._(thread.preview)}</Preview>
      </SubjectBody>
      <ReceivedAt>{thread.date}</ReceivedAt>
    </Row>
  );
}
