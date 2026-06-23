import { styled } from '@linaria/react';
import { IconLock } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { PersonAvatar } from '@/app-preview/primitives/PersonAvatar';
import { previewFontSize } from '@/app-preview/preview-font-size';

import { type EmailThread } from '../types/email-thread';

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

export function ThreadRow({ thread }: { thread: EmailThread }) {
  return (
    <Row>
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
  );
}
