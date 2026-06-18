import { css } from '@linaria/core';
import { type ReactNode } from 'react';

import {
  buildSchemeContext,
  MAX_CONTENT_WIDTH_PX,
  mediaUp,
  RHYTHM,
  type Scheme,
  semanticColor,
  spacing,
} from '@/tokens';

import { Container } from './Container';

// The only place a <section> exists. Every section gets its vertical rhythm
// from a named token class and resolves its semantic colors from its scheme —
// no per-section padding, no background props.
const sectionShellClassName = css`
  background-color: ${semanticColor.surface};
  min-width: 0;
  overflow: clip;
  position: relative;
  width: 100%;

  &[data-rhythm='section'] {
    padding-block: ${spacing(RHYTHM.section.top.base)}
      ${spacing(RHYTHM.section.bottom.base)};

    ${mediaUp('md')} {
      padding-block: ${spacing(RHYTHM.section.top.md)}
        ${spacing(RHYTHM.section.bottom.md)};
    }
  }

  &[data-rhythm='flush'] {
    overflow: visible;
    padding-block: 0;
  }

  &[data-rhythm='spacious'] {
    padding-block: ${spacing(RHYTHM.spacious.top.base)}
      ${spacing(RHYTHM.spacious.bottom.base)};

    ${mediaUp('md')} {
      padding-block: ${spacing(RHYTHM.spacious.top.md)}
        ${spacing(RHYTHM.spacious.bottom.md)};
    }
  }

  &[data-rhythm='hero'] {
    padding-block: ${spacing(RHYTHM.hero.top.base)}
      ${spacing(RHYTHM.hero.bottom.base)};

    ${mediaUp('md')} {
      padding-block: ${spacing(RHYTHM.hero.top.md)}
        ${spacing(RHYTHM.hero.bottom.md)};
    }
  }

  &[data-scheme='light'] {
    ${buildSchemeContext('light')}
  }

  &[data-scheme='muted'] {
    ${buildSchemeContext('muted')}
  }

  &[data-scheme='dark'] {
    ${buildSchemeContext('dark')}
  }

  /* Same-scheme neighbours share one surface, so the follower trims its top
     to a single small step rather than stacking a second full rhythm band of
     the same colour. The upper section keeps its full bottom rhythm; the
     follower's 6px (not 0) leaves room for frame decorations that overflow its
     top edge — TrustedBy's corner markers. Flush scenes own their own edges
     and opt out, as does a section with keepsTopRhythm — one whose own top
     padding is load-bearing (an editorial's top-anchored crosshair needs the
     room below it). */
  &[data-scheme='light']:not([data-rhythm='flush'])
    + &[data-scheme='light']:not([data-keep-top-rhythm]),
  &[data-scheme='muted']:not([data-rhythm='flush'])
    + &[data-scheme='muted']:not([data-keep-top-rhythm]),
  &[data-scheme='dark']:not([data-rhythm='flush'])
    + &[data-scheme='dark']:not([data-keep-top-rhythm]) {
    padding-top: ${spacing(1.5)};
  }

  /* A section can declare that it connects up into the section above it — a
     single continuous decorative frame across the seam (the partners promo
     hanging off the TrustedBy band). The upper section drops its bottom rhythm
     so its border meets the seam exactly, and shows overflow so its bottom
     corner markers sit on that line instead of being clipped; z-index keeps
     those markers above the section below. Same-scheme by intent — the
     connecting section is responsible for sharing the surface. */
  &:has(+ &[data-connect-up]) {
    overflow: visible;
    padding-bottom: 0;
    z-index: 1;
  }
`;

const backgroundLayerClassName = css`
  inset: 0;
  margin-inline: auto;
  max-width: ${MAX_CONTENT_WIDTH_PX}px;
  overflow: clip;
  pointer-events: none;
  position: absolute;
  z-index: 0;

  /* Opt out of the content cap so the decorative layer bleeds the full
     section width — for heroes whose backdrop frames the whole viewport. */
  &[data-full-bleed] {
    max-width: none;
  }
`;

const contentLayerClassName = css`
  position: relative;
  z-index: 1;
`;

export type SectionShellProps = {
  ariaLabel?: string;
  // Decorative layer behind the content (gradients, visuals), capped at the
  // content width — only the section's solid colour bleeds full-width, unless
  // fullBleedBackground lifts that cap.
  background?: ReactNode;
  children: ReactNode;
  // Forms one continuous frame with the section directly above (same scheme):
  // that section yields its bottom rhythm so the two tuck together.
  connectsUp?: boolean;
  // Removes the Container's horizontal gutter (the max-width cap and centring
  // stay) — for content that runs edge-to-edge within the content column,
  // like the marquee. Most sections keep the gutter.
  flushInline?: boolean;
  // Lets the background layer bleed the full section width instead of being
  // capped at the content width — for heroes whose backdrop frames the viewport.
  fullBleedBackground?: boolean;
  // Keeps its own full top rhythm instead of collapsing under a same-scheme
  // predecessor — for sections whose top padding is load-bearing.
  keepsTopRhythm?: boolean;
  rhythm?: 'section' | 'hero' | 'spacious' | 'flush';
  scheme?: Scheme;
};

export function SectionShell({
  ariaLabel,
  background,
  children,
  connectsUp = false,
  flushInline = false,
  fullBleedBackground = false,
  keepsTopRhythm = false,
  rhythm = 'section',
  scheme = 'light',
}: SectionShellProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={sectionShellClassName}
      data-connect-up={connectsUp ? '' : undefined}
      data-keep-top-rhythm={keepsTopRhythm ? '' : undefined}
      data-rhythm={rhythm}
      data-scheme={scheme}
    >
      {background !== undefined && (
        <div
          aria-hidden
          className={backgroundLayerClassName}
          data-background-layer=""
          data-full-bleed={fullBleedBackground ? '' : undefined}
        >
          {background}
        </div>
      )}
      <Container
        className={contentLayerClassName}
        data-flush-inline={flushInline ? '' : undefined}
      >
        {children}
      </Container>
    </section>
  );
}
