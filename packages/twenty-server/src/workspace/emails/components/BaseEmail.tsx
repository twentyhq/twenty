import * as React from 'react';
import { Container, Html } from '@react-email/components';

import { BaseHead } from 'src/workspace/emails/components/BaseHead';
import { Logo } from 'src/workspace/emails/components/Logo';

export const BaseEmail = ({ children }) => {
  return (
    <Html lang="en">
      <BaseHead />
      <Container width={290}>
        <Logo />
        {children}
      </Container>
    </Html>
  );
};
