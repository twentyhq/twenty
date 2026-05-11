import { CLIENT_ICONS } from '@/icons';
import type { CaseStudyCatalogEntry } from '@/lib/customers';
import { CustomerCasesCover } from '@/sections/CaseStudyCatalog/visuals/CustomerCasesCover';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledThumbnail = styled.div<{ variant: 'default' | 'large' }>`
  align-items: center;
  background-color: #000;
  display: flex;
  flex-shrink: 0;
  height: 200px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: ${({ variant }) => (variant === 'large' ? 'auto' : '240px')};
    min-height: ${({ variant }) => (variant === 'large' ? '460px' : '0')};
    width: ${({ variant }) => (variant === 'large' ? '50%' : '100%')};
  }
`;

const CoverLayer = styled.div`
  inset: 0;
  position: absolute;
`;

const LogoLayer = styled.div`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: absolute;
`;

const Badge = styled.span`
  bottom: ${theme.spacing(4)};
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  left: ${theme.spacing(6)};
  letter-spacing: 0.08em;
  position: absolute;
  text-transform: uppercase;
  z-index: 2;

  @media (min-width: ${theme.breakpoints.md}px) {
    bottom: ${theme.spacing(6)};
    left: ${theme.spacing(8)};
  }
`;

const CATALOG_LOGO_WIDTHS: Record<
  CaseStudyCatalogEntry['hero']['clientIcon'],
  number
> = {
  'nine-dots': 72,
  'alternative-partners': 220,
  netzero: 180,
  'act-education': 110,
  w3villa: 150,
  'elevate-consulting': 160,
};

const LARGE_LOGO_SCALE = 1.4;

type CardThumbnailProps = {
  clientIcon: CaseStudyCatalogEntry['hero']['clientIcon'];
  coverImageSrc?: string;
  dashColor?: string;
  hoverDashColor?: string;
  readingTime: string;
  variant: 'default' | 'large';
};

export function CardThumbnail({
  clientIcon,
  coverImageSrc,
  dashColor,
  hoverDashColor,
  readingTime,
  variant,
}: CardThumbnailProps) {
  const ClientIcon = CLIENT_ICONS[clientIcon];
  const baseLogoWidth = CATALOG_LOGO_WIDTHS[clientIcon] ?? 140;
  const logoWidth =
    variant === 'large' ? baseLogoWidth * LARGE_LOGO_SCALE : baseLogoWidth;

  return (
    <StyledThumbnail variant={variant}>
      {coverImageSrc ? (
        <CoverLayer>
          <CustomerCasesCover
            dashColor={dashColor}
            hoverDashColor={hoverDashColor}
            imageUrl={coverImageSrc}
          />
        </CoverLayer>
      ) : null}
      {ClientIcon ? (
        <LogoLayer>
          <ClientIcon fillColor="#FFFFFF" size={logoWidth} />
        </LogoLayer>
      ) : null}
      {variant === 'large' ? <Badge>Case · {readingTime}</Badge> : null}
    </StyledThumbnail>
  );
}
