import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { mediaUp, type Scheme, spacing } from '@/tokens';

import { Body } from './body';
import { GuideCrosshair } from './guide-crosshair';
import { Heading } from './heading';
import { SectionShell } from './section-shell';

// The centred variant's decorative crosshair has only ever anchored here.
const CENTERED_CROSSHAIR = { crossX: 'calc(50% + 334px)', crossY: '198px' };

const SignoffStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;

  &[data-centered] {
    padding-block: ${spacing(20)};

    ${mediaUp('md')} {
      justify-content: center;
      min-height: 759px;
      padding-block: 0;
    }
  }
`;

// Measure tuned to a clean break without coupling a <br> into the translation.
const Subline = styled.div`
  margin-top: ${spacing(2)};
  max-width: 400px;
  width: 100%;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
  margin-top: ${spacing(6)};
`;

export type SignoffProps = {
  body: string;
  // Centred fills a tall panel with a decorative crosshair (flush, owns its
  // height); otherwise it's a centred block on the standard section rhythm.
  centered?: boolean;
  children: ReactNode;
  heading: string;
  scheme?: Scheme;
};

export function Signoff({
  body,
  centered = false,
  children,
  heading,
  scheme = 'light',
}: SignoffProps) {
  return (
    <SectionShell
      background={
        centered ? (
          <GuideCrosshair
            crossX={CENTERED_CROSSHAIR.crossX}
            crossY={CENTERED_CROSSHAIR.crossY}
          />
        ) : undefined
      }
      keepsTopRhythm={!centered}
      rhythm={centered ? 'flush' : 'spacious'}
      scheme={scheme}
    >
      <SignoffStack data-centered={centered ? '' : undefined}>
        <Heading as="h2" size="lg" weight="light">
          {heading}
        </Heading>
        <Subline>
          <Body muted size="sm">
            {body}
          </Body>
        </Subline>
        <Actions>{children}</Actions>
      </SignoffStack>
    </SectionShell>
  );
}
