'use client';

import { css } from '@linaria/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

import {
  BREAKPOINT_PX,
  buildSchemeDeclarations,
  color,
  mediaUp,
  radius,
  spacing,
} from '@/tokens';
import { Body, Button, Heading, SectionShell } from '@/ui';

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

export function MarketplaceBriefPrompt() {
  const { i18n } = useLingui();

  return (
    <SectionShell rhythm="section" scheme="muted">
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
              {i18n._(msg`Didn't find the *right partner*?`)}
            </Heading>
            <Body muted size="sm">
              {i18n._(
                msg`Tell us what you need and we'll match you with a certified Twenty partner.`,
              )}
            </Body>
          </Copy>
          <Actions>
            <Button
              href="/partners/brief"
              label={i18n._(msg`Submit a brief`)}
            />
          </Actions>
        </Content>
      </Band>
    </SectionShell>
  );
}
