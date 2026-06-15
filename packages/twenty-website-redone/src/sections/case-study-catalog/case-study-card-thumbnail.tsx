import { styled } from '@linaria/react';

import {
  color,
  fontFamily,
  fontSize,
  mediaUp,
  type PaletteToken,
  spacing,
} from '@/tokens';

import {
  CLIENT_LOGO_DISPLAY_WIDTHS,
  ClientLogo,
  type ClientLogoKey,
  CustomerCasesCover,
} from '@/case-studies';

const LARGE_LOGO_SCALE = 1.4;

const Thumbnail = styled.div`
  align-items: center;
  background-color: ${color('black')};
  display: flex;
  flex-shrink: 0;
  height: 200px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    height: 240px;
  }

  &[data-variant='large'] {
    ${mediaUp('md')} {
      height: auto;
      min-height: 460px;
      width: 50%;
    }
  }
`;

const CoverLayer = styled.div`
  inset: 0;
  position: absolute;
`;

const LogoLayer = styled.div`
  align-items: center;
  color: ${color('white')};
  display: flex;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: absolute;
`;

const Badge = styled.span`
  bottom: ${spacing(4)};
  color: ${color('white-60')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  left: ${spacing(6)};
  letter-spacing: 0.08em;
  position: absolute;
  text-transform: uppercase;
  z-index: 2;

  ${mediaUp('md')} {
    bottom: ${spacing(6)};
    left: ${spacing(8)};
  }
`;

export type CaseStudyCardThumbnailProps = {
  accent: PaletteToken;
  badge?: string;
  clientIcon: ClientLogoKey;
  coverImageSrc: string;
  variant: 'default' | 'large';
};

export function CaseStudyCardThumbnail({
  accent,
  badge,
  clientIcon,
  coverImageSrc,
  variant,
}: CaseStudyCardThumbnailProps) {
  const baseWidth = CLIENT_LOGO_DISPLAY_WIDTHS[clientIcon];
  const logoWidth =
    variant === 'large' ? baseWidth * LARGE_LOGO_SCALE : baseWidth;

  return (
    <Thumbnail data-variant={variant}>
      <CoverLayer>
        <CustomerCasesCover accent={accent} imageUrl={coverImageSrc} />
      </CoverLayer>
      <LogoLayer>
        <ClientLogo client={clientIcon} sizePx={logoWidth} />
      </LogoLayer>
      {variant === 'large' && badge ? <Badge>{badge}</Badge> : null}
    </Thumbnail>
  );
}
