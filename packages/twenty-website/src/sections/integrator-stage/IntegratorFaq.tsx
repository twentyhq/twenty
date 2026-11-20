import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Eyebrow, Heading, SectionShell } from '@/ui';

// Title left, questions right: both start on the page's column edges.
const Layout = styled.div`
  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    column-gap: ${spacing(16)};
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);

    & > * + * {
      margin-top: 0;
    }
  }
`;

const Intro = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

// The shared accordion insets itself to 66% for a full-width section; in a
// column it fills the column instead.
const Questions = styled.div`
  & > div {
    width: 100%;
  }
`;

type IntegratorFaqProps = {
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  children: ReactNode;
};

// PROTOTYPE direction d.
export function IntegratorFaq({
  eyebrow,
  heading,
  children,
}: IntegratorFaqProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="spacious" scheme="dark">
      <Layout>
        <Intro>
          <Eyebrow>{i18n._(eyebrow)}</Eyebrow>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(heading)}
          </Heading>
        </Intro>
        <Questions>{children}</Questions>
      </Layout>
    </SectionShell>
  );
}
