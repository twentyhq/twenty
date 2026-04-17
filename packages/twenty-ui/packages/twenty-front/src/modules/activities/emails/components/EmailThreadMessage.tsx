import { styled } from '@linaria/react';
import { useState } from 'react';

import { EmailThreadMessageBody } from '@/activities/emails/components/EmailThreadMessageBody';
import { EmailThreadMessageBodyPreview } from '@/activities/emails/components/EmailThreadMessageBodyPreview';
import { EmailThreadMessageReceivers } from '@/activities/emails/components/EmailThreadMessageReceivers';
import { EmailThreadMessageSender } from '@/activities/emails/components/EmailThreadMessageSender';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { MessageChannelVisibility } from '~/generated/graphql';

const StyledThreadMessage = styled.div<{ hideBottomBorder?: boolean }>`
  border-bottom: ${({ hideBottomBorder }) =>
    hideBottomBorder
      ? 'none'
      : `1px solid ${themeCssVariables.border.color.light}`};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[0]};
`;

const StyledThreadMessageHeader = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
`;

const StyledThreadMessageBody = styled.div`
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
`;

type EmailThreadMessageProps = {
  body: string;
  sentAt: string;
  sender: EmailThreadMessageParticipant;
  participants: EmailThreadMessageParticipant[];
  isExpanded?: boolean;
  hideBottomBorder?: boolean;
};

export const EmailThreadMessage = ({
  body,
  sentAt,
  sender,
  participants,
  isExpanded = false,
  hideBottomBorder = false,
}: EmailThreadMessageProps) => {
  const [isOpen, setIsOpen] = useState(isExpanded);

  const receivers = participants.filter(
    (participant) => participant.role !== MessageParticipantRole.FROM,
  );

  if (!isDefined(sender) || receivers.length === 0) {
    return null;
  }

  const isRestricted =
    body === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

  return (
    <StyledThreadMessage
      hideBottomBorder={hideBottomBorder}
      onClick={() => !isOpen && setIsOpen(true)}
      style={{ cursor: isOpen || isRestricted ? 'auto' : 'pointer' }}
    >
      <StyledThreadMessageHeader onClick={() => isOpen && setIsOpen(false)}>
        <EmailThreadMessageSender sender={sender} sentAt={sentAt} />
        {isOpen && <EmailThreadMessageReceivers receivers={receivers} />}
      </StyledThreadMessageHeader>
      <StyledThreadMessageBody>
        {isRestricted ? (
          <EmailThreadNotShared
            visibility={MessageChannelVisibility.METADATA}
          />
        ) : isOpen ? (
          <EmailThreadMessageBody body={body} isDisplayed />
        ) : (
          <EmailThreadMessageBodyPreview body={body} />
        )}
      </StyledThreadMessageBody>
    </StyledThreadMessage>
  );
};
import { styled } from '@linaria/react';
import { useState } from 'react';

import { EmailThreadMessageBody } from '@/activities/emails/components/EmailThreadMessageBody';
import { EmailThreadMessageBodyPreview } from '@/activities/emails/components/EmailThreadMessageBodyPreview';
import { EmailThreadMessageReceivers } from '@/activities/emails/components/EmailThreadMessageReceivers';
import { EmailThreadMessageSender } from '@/activities/emails/components/EmailThreadMessageSender';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { MessageChannelVisibility } from '~/generated/graphql';

const StyledThreadMessage = styled.div<{ hideBottomBorder?: boolean }>`
  border-bottom: ${({ hideBottomBorder }) =>
    hideBottomBorder
      ? 'none'
      : `1px solid ${themeCssVariables.border.color.light}`};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[0]};
`;

const StyledThreadMessageHeader = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
`;

const StyledThreadMessageBody = styled.div`
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
`;

type EmailThreadMessageProps = {
  body: string;
  sentAt: string;
  sender: EmailThreadMessageParticipant;
  participants: EmailThreadMessageParticipant[];
  isExpanded?: boolean;
  hideBottomBorder?: boolean;
};

export const EmailThreadMessage = ({
  body,
  sentAt,
  sender,
  participants,
  isExpanded = false,
  hideBottomBorder = false,
}: EmailThreadMessageProps) => {
  const [isOpen, setIsOpen] = useState(isExpanded);

  const receivers = participants.filter(
    (participant) => participant.role !== MessageParticipantRole.FROM,
  );

  if (!isDefined(sender) || receivers.length === 0) {
    return null;
  }

  const isRestricted =
    body === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

  return (
    <StyledThreadMessage
      hideBottomBorder={hideBottomBorder}
      onClick={() => !isOpen && setIsOpen(true)}
      style={{ cursor: isOpen || isRestricted ? 'auto' : 'pointer' }}
    >
      <StyledThreadMessageHeader onClick={() => isOpen && setIsOpen(false)}>
        <EmailThreadMessageSender sender={sender} sentAt={sentAt} />
        {isOpen && <EmailThreadMessageReceivers receivers={receivers} />}
      </StyledThreadMessageHeader>
      <StyledThreadMessageBody>
        {isRestricted ? (
          <EmailThreadNotShared
            visibility={MessageChannelVisibility.METADATA}
          />
        ) : isOpen ? (
          <EmailThreadMessageBody body={body} isDisplayed />
        ) : (
          <EmailThreadMessageBodyPreview body={body} />
        )}
      </StyledThreadMessageBody>
    </StyledThreadMessage>
  );
};

