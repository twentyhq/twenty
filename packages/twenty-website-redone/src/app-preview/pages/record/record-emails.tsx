import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { IconPlus } from '@tabler/icons-react';

import { type RecordEmail } from '../../types';
import { AvatarGroup } from './avatar-group';
import { RECORD_PANEL_CHROME } from './record-panel-chrome';

const EmailHeading = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  max-width: 34%;
  overflow: hidden;
`;

const SenderNames = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  margin: 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ThreadCount = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
`;

const SubjectBody = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 8px;
  overflow: hidden;
`;

const EmailSubject = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmailBody = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  flex: 1;
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ReceivedAt = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  flex-shrink: 0;
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  padding: 0 4px;
  white-space: nowrap;
`;

const {
  ActivityRowBox,
  ListCard,
  TabAddButton,
  TabHeader,
  TabHeaderCount,
  TabHeaderLabel,
  TabHeaderTitle,
  TabSection,
} = RECORD_PANEL_CHROME;

export function RecordEmails({ emails }: { emails: RecordEmail[] }) {
  return (
    <TabSection>
      <TabHeader>
        <TabHeaderLabel>
          <TabHeaderTitle>Inbox</TabHeaderTitle>
          <TabHeaderCount>{emails.length}</TabHeaderCount>
        </TabHeaderLabel>
        <TabAddButton>
          <IconPlus size={14} stroke={2} />
          Compose
        </TabAddButton>
      </TabHeader>
      <ListCard>
        {emails.map((email, index) => (
          <ActivityRowBox $index={index} key={email.id}>
            <EmailHeading>
              <AvatarGroup people={email.participants} size={16} />
              <SenderNames>
                {email.participants.map((person) => person.name).join(', ')}
              </SenderNames>
              <ThreadCount>{email.count}</ThreadCount>
            </EmailHeading>
            <SubjectBody>
              <EmailSubject>{email.subject}</EmailSubject>
              <EmailBody>{email.body}</EmailBody>
            </SubjectBody>
            <ReceivedAt>{email.date}</ReceivedAt>
          </ActivityRowBox>
        ))}
      </ListCard>
    </TabSection>
  );
}
