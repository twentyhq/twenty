import { IconUsers } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { type CSSProperties } from 'react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { CornerMarkers } from '@/ui';

import { TRUSTED_BY_LOGOS, type TrustedByLogo } from './trusted-by.data';

const Card = styled.div`
  align-items: center;
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(5)};
  padding: ${spacing(5)} ${spacing(6)};
  position: relative;

  ${mediaUp('md')} {
    align-items: stretch;
    flex-direction: row;
    gap: 0;
    padding: 0 ${spacing(8)};
  }
`;

const Cell = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;

  ${mediaUp('md')} {
    padding-block: ${spacing(5)};

    & + & {
      border-left: 1px solid ${semanticColor.line};
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
  src,
}: TrustedByLogo) {
  return (
    <LogoFrame
      aria-hidden
      style={
        {
          aspectRatio: String(aspectRatio),
          '--logo-h': heightPx,
        } as CSSProperties
      }
    >
      <NextImage
        alt=""
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

export function TrustedBy() {
  return (
    <Card>
      <CornerMarkers />
      <LabelCell>
        <MonoLabel>trusted by</MonoLabel>
      </LabelCell>
      <LogosCell>
        <LogoStrip>
          {TRUSTED_BY_LOGOS.map((logo) => (
            <Logo key={logo.src} {...logo} />
          ))}
        </LogoStrip>
      </LogosCell>
      <CountCell>
        <IconUsers size={14} stroke={1.6} />
        <MonoLabel>+10k others</MonoLabel>
      </CountCell>
    </Card>
  );
}
