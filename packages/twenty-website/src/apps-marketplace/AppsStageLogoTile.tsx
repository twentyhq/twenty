import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  REDUCED_MOTION,
  semanticColor,
} from '@/tokens';

import { type AppsStageLogoInk } from './apps-stage-logo-ink';

// PROTOTYPE (?direction=d): one dark tile per app. A logo that ships its own
// coloured square fills the tile instead of sitting in it (no tile in a tile).
const Tile = styled.span`
  --apps-stage-tint: ${color('white')};
  display: block;
  height: 100%;
  position: relative;
  width: 100%;
`;

// The logo's own colours, blurred: the light each app casts on the stage.
const Glow = styled.img`
  filter: blur(calc(var(--apps-stage-tile-size, 96px) * 0.34)) saturate(1.5);
  height: 116%;
  left: -8%;
  object-fit: contain;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: -8%;
  transform: translateY(20%);
  transition: opacity calc(${DURATION.xl} * 2) ${EASING.gentle} ${DURATION.md};
  width: 116%;

  [data-kind] > & {
    opacity: var(--apps-stage-glow-opacity, 0.5);
  }

  [data-kind='plate'] > & {
    object-fit: cover;
    opacity: 0.36;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const Face = styled.span`
  align-items: center;
  background:
    radial-gradient(
      120% 90% at 50% 0%,
      color-mix(in srgb, var(--apps-stage-tint) 14%, transparent),
      transparent 72%
    ),
    linear-gradient(180deg, ${color('charcoal')}, ${color('black')});
  border-radius: 9%;
  color: ${semanticColor.ink};
  display: flex;
  font-family: ${fontFamily('serif')};
  font-size: calc(var(--apps-stage-tile-size, 96px) * 0.42);
  font-weight: ${FONT_WEIGHT.light};
  inset: 0;
  justify-content: center;
  overflow: hidden;
  position: absolute;

  /* Edge and top highlight sit above the logo so a plate keeps them too. */
  &::after {
    border-radius: inherit;
    box-shadow:
      inset 0 0 0 1px var(--apps-stage-tile-edge, ${color('white-10')}),
      inset 0 1px 0 ${color('white-20')};
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
    transition: box-shadow ${DURATION.xxs} ${EASING.gentle};
  }
`;

const Logo = styled.img`
  display: block;
  height: 54%;
  object-fit: contain;
  opacity: 0;
  transition: opacity ${DURATION.xl} ${EASING.gentle};
  width: 54%;

  /* Without scripts the logo is never read: show it anyway, late. */
  animation: apps-stage-logo-unread 1ms linear 3s forwards;

  @keyframes apps-stage-logo-unread {
    to {
      opacity: 1;
    }
  }

  [data-kind] > * > & {
    opacity: 1;
  }

  [data-kind='plate'] > * > & {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

type TileStyle = CSSProperties & { '--apps-stage-tint'?: string };

type AppsStageLogoTileProps = {
  name: string;
  logoUrl?: string;
  ink?: AppsStageLogoInk;
  hasGlow?: boolean;
  loading?: 'lazy' | 'eager';
};

export function AppsStageLogoTile({
  name,
  logoUrl,
  ink,
  hasGlow = false,
  loading = 'lazy',
}: AppsStageLogoTileProps) {
  const hasLogo = logoUrl !== undefined && logoUrl.length > 0;
  const style: TileStyle =
    ink !== undefined && ink.tint.length > 0
      ? { '--apps-stage-tint': ink.tint }
      : {};

  return (
    <Tile data-kind={ink?.kind} style={style}>
      {hasGlow && hasLogo && (
        <Glow alt="" aria-hidden loading={loading} src={logoUrl} />
      )}
      <Face>
        {hasLogo ? (
          <Logo alt="" loading={loading} src={logoUrl} />
        ) : (
          name.trim().charAt(0).toUpperCase()
        )}
      </Face>
    </Tile>
  );
}
