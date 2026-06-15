import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { styled } from '@linaria/react';

import { PeopleGroupMark } from '@/icons';
import NextImage from 'next/image';
import { type CSSProperties } from 'react';

import {
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  type Scheme,
  semanticColor,
  spacing,
} from '@/tokens';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { CornerMarkers, SectionShell } from '@/ui';

import { TRUSTED_BY_LOGOS, type TrustedByLogo } from './trusted-by.data';

const Card = styled.div`
  align-items: stretch;
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  padding: 0 ${spacing(5)};
  position: relative;

  ${mediaUp('md')} {
    flex-direction: row;
    padding: 0 ${spacing(8)};
  }
`;

// The same tripartite cell structure on both axes: stacked with horizontal
// hairlines below md, a row with vertical hairlines above it.
const Cell = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding-block: ${spacing(4)};

  & + & {
    border-top: 1px solid ${semanticColor.line};
  }

  ${mediaUp('md')} {
    padding-block: ${spacing(5)};

    & + & {
      border-left: 1px solid ${semanticColor.line};
      border-top: none;
    }
  }
`;

const LabelCell = styled(Cell)`
  ${mediaUp('md')} {
    padding-right: ${spacing(6)};
  }
`;

const LogosCell = styled(Cell)`
  flex: 1 1 auto;
  padding-block: ${spacing(5)};

  ${mediaUp('md')} {
    padding-inline: ${spacing(6)};
  }
`;

const CountCell = styled(Cell)`
  color: ${semanticColor.inkMuted};
  gap: ${spacing(2)};

  ${mediaUp('md')} {
    padding-left: ${spacing(6)};
  }

  /* The authored icon is intrinsically blue (#4A38F5); the chip reads
     muted like the logo wall, so it is neutralized the way the old site
     does it. */
  img {
    filter: grayscale(1);
    opacity: 0.72;
  }
`;

const MonoLabel = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
`;

const LogoStrip = styled.div`
  align-items: center;
  column-gap: ${spacing(6)};
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: ${spacing(5)};

  ${mediaUp('lg')} {
    --logo-scale: 0.92;

    column-gap: ${spacing(4)};
    flex-wrap: nowrap;
    justify-content: space-between;
    width: 100%;
  }
`;

const LogoFrame = styled.span`
  flex-shrink: 0;
  height: calc(var(--logo-h) * var(--logo-scale, 1) * 1px);
  position: relative;
`;

function Logo({
  aspectRatio,
  grayBrightness = 1,
  grayOpacity = 0.72,
  heightPx,
  name,
  src,
}: TrustedByLogo) {
  return (
    <LogoFrame
      style={
        {
          aspectRatio: String(aspectRatio),
          '--logo-h': heightPx,
        } as CSSProperties
      }
    >
      <NextImage
        alt={name}
        fill
        sizes={`${Math.ceil(heightPx * aspectRatio)}px`}
        src={src}
        style={{
          filter: `grayscale(1) brightness(${grayBrightness})`,
          objectFit: 'contain',
          opacity: grayOpacity,
        }}
        unoptimized
      />
    </LogoFrame>
  );
}

export function TrustedBy({ scheme = 'light' }: { scheme?: Scheme }) {
  const i18n = getServerI18n();

  return (
    <SectionShell
      ariaLabel={i18n._(msg`Trusted by leading organizations`)}
      scheme={scheme}
    >
      <Card>
        <CornerMarkers />
        <LabelCell>
          <MonoLabel>
            <Trans>trusted by</Trans>
          </MonoLabel>
        </LabelCell>
        <LogosCell>
          <LogoStrip>
            {TRUSTED_BY_LOGOS.map((logo) => (
              <Logo key={logo.src} {...logo} />
            ))}
          </LogoStrip>
        </LogosCell>
        <CountCell>
          <PeopleGroupMark sizePx={14} />
          <MonoLabel>
            <Trans>+10k others</Trans>
          </MonoLabel>
        </CountCell>
      </Card>
    </SectionShell>
  );
}
