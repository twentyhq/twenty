import * as React from 'react';
import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Container, Heading } from '@react-email/components';

import { BaseHead } from 'src/workspace/emails/components/BaseHead';
import { HighlightedText } from 'src/workspace/emails/components/HighlightedText';
import { CallToAction } from 'src/workspace/emails/components/CallToAction';

export const CleanInactiveWorkspaceEmail = ({ title, daysLeft, userName }) => {
  const daysLeftInfo = daysLeft > 1 ? `${daysLeft} days left` : `One day left`;

  return (
    <Html lang="en">
      <BaseHead />
      <Container width={290}>
        <Heading as="h1">{title}</Heading>
        <HighlightedText value={daysLeftInfo} />
        <Text>
          Hello {userName},
          <br />
          <br />
          It appears that there has been a period of inactivity on your Stripe
          workspace.
          <br />
          <br />
          Please note that the account is due for deactivation soon, and all
          associated data within this workspace will be deleted.
          <br />
          <br />
          No need for concern, though! Simply log in to your workspace within
          the next 10 days to retain access.
        </Text>
        <CallToAction href="https://app.twenty.com" value="Connect to Twenty" />
      </Container>
    </Html>
  );
};

export default CleanInactiveWorkspaceEmail;
