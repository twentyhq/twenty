import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { type ComponentProps, type ReactNode } from 'react';

import {
  BREAKPOINT_PX,
  buildSchemeDeclarations,
  color,
  mediaUp,
  radius,
  spacing,
} from '@/tokens';

import { Body } from './Body';
import { Heading } from './Heading';
import { SectionShell } from './SectionShell';

const Band = styled.div`
  ${buildSchemeDeclarations('light')}
  background-color: ${color('white')};
  border-radius: ${radius(1)};
  color: ${color('black')};
  overflow: hidden;
  padding: ${spacing(6)} ${spacing(4)} ${spacing(6)} ${spacing(6)};
  position: relative;

  ${mediaUp('md')} {
    padding-right: ${spacing(12)};
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  position: relative;
  z-index: 1;

  & > * + * {
    margin-top: ${spacing(6)};
  }

  ${mediaUp('md')} {
    align-items: center;
    column-gap: ${spacing(2)};
    grid-template-columns: fit-content(60%) minmax(0, 1fr);

    & > * + * {
      margin-top: 0;
    }
  }
`;

const Copy = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: flex-start;

  ${mediaUp('md')} {
    justify-content: flex-end;
  }
`;

const OverlayLayer = styled.div`
  bottom: 0;
  left: 50%;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;

  ${mediaUp('md')} {
    left: auto;
    width: clamp(252px, 24.5%, 332px);
  }
`;

const OverlayImageFrame = styled.div`
  inset: 0;
  position: absolute;

  ${mediaUp('md')} {
    inset: ${spacing(3)};
  }
`;

const overlayImageClassName = css`
  object-fit: cover;
  object-position: right center;
`;

type EngagementBandProps = {
  heading: string;
  body: string;
  actions: ReactNode;
  rhythm?: ComponentProps<typeof SectionShell>['rhythm'];
};

export function EngagementBand({
  heading,
  body,
  actions,
  rhythm,
}: EngagementBandProps) {
  return (
    <SectionShell rhythm={rhythm} scheme="muted">
      <Band>
        <OverlayLayer aria-hidden>
          <OverlayImageFrame>
            <NextImage
              alt=""
              className={overlayImageClassName}
              fill
              sizes={`(min-width: ${BREAKPOINT_PX.md}px) 308px, 50vw`}
              src="/images/pricing/engagement-band/halftone-on-white.webp"
            />
          </OverlayImageFrame>
        </OverlayLayer>
        <Content>
          <Copy>
            <Heading as="h2" size="sm" weight="light">
              {heading}
            </Heading>
            <Body muted size="sm">
              {body}
            </Body>
          </Copy>
          <Actions>{actions}</Actions>
        </Content>
      </Band>
    </SectionShell>
  );
}
