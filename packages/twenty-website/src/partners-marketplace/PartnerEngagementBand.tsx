import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import NextImage from 'next/image';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
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

type PartnerEngagementBandProps = {
  heading: MessageDescriptor;
  body: MessageDescriptor;
  ctaLabel: MessageDescriptor;
  ctaHref: string;
  overlayImageSrc?: string;
};

export function PartnerEngagementBand({
  heading,
  body,
  ctaLabel,
  ctaHref,
  overlayImageSrc,
}: PartnerEngagementBandProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="muted">
      <Band>
        {overlayImageSrc !== undefined && (
          <OverlayLayer aria-hidden>
            <OverlayImageFrame>
              <NextImage
                alt=""
                className={overlayImageClassName}
                fill
                sizes={`(min-width: ${BREAKPOINT_PX.md}px) 308px, 50vw`}
                src={overlayImageSrc}
              />
            </OverlayImageFrame>
          </OverlayLayer>
        )}
        <Content>
          <Copy>
            <Heading as="h2" size="sm" weight="light">
              {i18n._(heading)}
            </Heading>
            <Body muted size="sm">
              {i18n._(body)}
            </Body>
          </Copy>
          <Actions>
            <Button
              href={ctaHref}
              label={i18n._(ctaLabel)}
              variant="outlined"
            />
          </Actions>
        </Content>
      </Band>
    </SectionShell>
  );
}
