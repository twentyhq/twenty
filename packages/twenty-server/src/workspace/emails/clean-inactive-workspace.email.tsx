import * as React from 'react';
import { Html } from '@react-email/html';
import { Container, Heading } from '@react-email/components';

import { BaseHead } from 'src/workspace/emails/components/BaseHead';
import { HighlightedText } from 'src/workspace/emails/components/HighlightedText';
import { CallToAction } from 'src/workspace/emails/components/CallToAction';
import { MainText } from 'src/workspace/emails/components/MainText';
import { Logo } from 'src/workspace/emails/components/Logo';

export const CleanInactiveWorkspaceEmail = ({
  title,
  daysLeft,
  userName,
  workspaceDisplayName,
}) => {
  const daysLeftInfo = daysLeft > 1 ? `${daysLeft} days left` : `One day left`;

  return (
    <Html lang="en">
      <BaseHead />
      <Container width={290}>
        <Logo />
        <Heading as="h1">{title}</Heading>
        <HighlightedText value={daysLeftInfo} />
        <MainText>
          Hello {userName},
          <br />
          <br />
          It appears that there has been a period of inactivity on your{' '}
          <b>{workspaceDisplayName}</b> workspace.
          <br />
          <br />
          Please note that the account is due for deactivation soon, and all
          associated data within this workspace will be deleted.
          <br />
          <br />
          No need for concern, though! Simply log in to your workspace within
          the next 10 days to retain access.
        </MainText>
        <CallToAction href="https://app.twenty.com" value="Connect to Twenty" />
      </Container>
    </Html>
  );
};

export default CleanInactiveWorkspaceEmail;
