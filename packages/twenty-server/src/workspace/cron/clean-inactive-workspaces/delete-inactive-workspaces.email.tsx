import * as React from 'react';

import { HighlightedText } from 'src/emails/components/HighlightedText';
import { MainText } from 'src/emails/components/MainText';
import { Title } from 'src/emails/components/Title';
import { BaseEmail } from 'src/emails/components/BaseEmail';
import { CallToAction } from 'src/emails/components/CallToAction';

type DeleteInactiveWorkspaceEmailData = {
  daysSinceDead: number;
  workspaceId: string;
};

export const DeleteInactiveWorkspaceEmail = ({
  daysSinceDead,
  workspaceId,
}: DeleteInactiveWorkspaceEmailData) => {
  return (
    <BaseEmail>
      <Title value="Dead Workspace 😵" />
      <HighlightedText value={`Inactive since ${daysSinceDead} day(s)`} />
      <MainText>
        Workspace <b>{workspaceId}</b> should be deleted.
      </MainText>
      <CallToAction href="https://app.twenty.com" value="Connect to Twenty" />
    </BaseEmail>
  );
};

export default DeleteInactiveWorkspaceEmail;
