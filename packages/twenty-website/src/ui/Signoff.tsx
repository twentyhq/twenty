import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { mediaUp, type Scheme, spacing } from '@/tokens';

import { Body } from './Body';
import { GuideCrosshair } from './GuideCrosshair';
import { Heading } from './Heading';
import { SectionShell } from './SectionShell';

type SignoffCrosshairSide = 'left' | 'right';

const SIGNOFF_CROSSHAIR_Y = '198px';
const SIGNOFF_CROSSHAIR_X: Record<SignoffCrosshairSide, string> = {
  left: 'calc(50% - 334px)',
  right: 'calc(50% + 334px)',
};

const SignoffStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-block: ${spacing(20)};
  text-align: center;

  ${mediaUp('md')} {
    justify-content: center;
    min-height: 759px;
    padding-block: 0;
  }
`;

const HeadingMeasure = styled.div`
  max-width: 615px;
  width: 100%;
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
  children: ReactNode;
  crosshairSide?: SignoffCrosshairSide;
  heading: string;
  scheme?: Scheme;
};

export function Signoff({
  body,
  children,
  crosshairSide = 'right',
  heading,
  scheme = 'light',
}: SignoffProps) {
  return (
    <SectionShell
      background={
        <GuideCrosshair
          crossX={SIGNOFF_CROSSHAIR_X[crosshairSide]}
          crossY={SIGNOFF_CROSSHAIR_Y}
        />
      }
      rhythm="flush"
      scheme={scheme}
    >
      <SignoffStack>
        <HeadingMeasure>
          <Heading as="h2" size="lg" weight="light">
            {heading}
          </Heading>
        </HeadingMeasure>
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
