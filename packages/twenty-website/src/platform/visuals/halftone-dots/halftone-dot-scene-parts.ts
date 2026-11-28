import { styled } from '@linaria/react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  GUTTER,
  HERO_COMPOSITION,
  mediaUp,
  radius,
  RHYTHM,
  semanticColor,
  spacing,
} from '@/tokens';

// The hero's banner: full bleed, it closes the hero (the partners globe's
// frame). Height follows the width, within bounds.
export const SceneBanner = styled.div`
  height: ${HERO_COMPOSITION.visualBannerHeight};
  margin-bottom: calc(-1 * ${spacing(RHYTHM.hero.bottom.base)});
  margin-inline: calc(-1 * ${spacing(GUTTER.base)});
  overflow: hidden;
  position: relative;

  ${mediaUp('md')} {
    margin-bottom: calc(-1 * ${spacing(RHYTHM.hero.bottom.md)});
    margin-inline: calc(-1 * ${spacing(GUTTER.md)});
  }

  canvas {
    display: block;
    height: 100%;
    inset: 0;
    position: absolute;
    width: 100%;
  }
`;

export const SceneOverlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

// Placed each frame by the stage (--x / --y / --o / --s), above its point.
export const SceneTag = styled.div`
  display: none;
  left: 0;
  opacity: var(--o, 0);
  position: absolute;
  top: 0;
  transform: translate(var(--x), var(--y)) translate(-50%, -100%)
    scale(var(--s, 1));
  transform-origin: 50% 100%;

  /* A narrow banner keeps only the scene's main tags: the others would run
     off its sides or over each other. The stage sets display inline. */
  &[data-secondary] {
    visibility: hidden;

    ${mediaUp('md')} {
      visibility: visible;
    }
  }
`;

// A solid's name, under it.
export const SceneLabel = styled.div`
  color: ${semanticColor.inkMuted};
  display: none;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  left: 0;
  letter-spacing: 0.08em;
  opacity: var(--o, 1);
  position: absolute;
  text-transform: uppercase;
  top: 0;
  transform: translate(var(--x), var(--y)) translate(-50%, 0);
  white-space: nowrap;

  &[data-emphasis] {
    color: ${semanticColor.ink};
  }

  &[data-secondary] {
    visibility: hidden;

    ${mediaUp('md')} {
      visibility: visible;
    }
  }
`;

// The partners globe's tag: mark, name, mono detail.
export const TagPill = styled.div`
  align-items: center;
  background-color: ${color('white')};
  border-radius: ${radius(2)};
  display: flex;
  gap: ${spacing(2)};
  padding: ${spacing(1.5)} ${spacing(3)} ${spacing(1.5)} ${spacing(1.5)};
  white-space: nowrap;
`;

// The directory card's initials mark; blue for money and work.
export const TagMark = styled.span`
  align-items: center;
  background-color: color-mix(in srgb, ${semanticColor.ink} 8%, transparent);
  border-radius: ${radius(1.5)};
  color: ${semanticColor.ink};
  display: inline-flex;
  flex-shrink: 0;
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(2.5)};
  font-weight: ${FONT_WEIGHT.light};
  height: ${spacing(6)};
  justify-content: center;
  width: ${spacing(6)};

  &[data-accent] {
    background-color: ${color('blue')};
    color: ${color('white')};
    font-family: ${fontFamily('sans')};
    font-weight: ${FONT_WEIGHT.medium};
  }
`;

export const TagName = styled.span`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
`;

export const TagDetail = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;
