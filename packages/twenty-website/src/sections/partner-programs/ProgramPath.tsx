import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

import { type ProgramStep } from './program-step.type';
import { ProgramPathScroller } from './ProgramPathScroller';

const Layout = styled.div`
  & > * + * {
    margin-top: ${spacing(12)};
  }

  ${mediaUp('md')} {
    & > * + * {
      margin-top: ${spacing(16)};
    }
  }
`;

const Intro = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);

  & > * + * {
    margin-top: ${spacing(5)};
  }

  ${mediaUp('md')} {
    align-items: end;
    column-gap: ${spacing(16)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 360px);

    & > * + * {
      margin-top: 0;
    }
  }
`;

const IntroTitle = styled.div`
  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

type ProgramPathProps = {
  anchorId: string;
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  body: MessageDescriptor;
  steps: readonly ProgramStep[];
};

// The steps scroll by while their visual stays pinned.
export function ProgramPath({
  anchorId,
  eyebrow,
  heading,
  body,
  steps,
}: ProgramPathProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm scheme="muted">
      <Layout id={anchorId}>
        <Intro>
          <IntroTitle>
            <Eyebrow>{i18n._(eyebrow)}</Eyebrow>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(heading)}
            </Heading>
          </IntroTitle>
          <Body muted size="sm">
            {i18n._(body)}
          </Body>
        </Intro>
        <ProgramPathScroller steps={steps} />
      </Layout>
    </SectionShell>
  );
}
