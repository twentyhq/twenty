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

  &[data-scheme='light']:not([data-rhythm='flush'])
    + &[data-scheme='light']:not([data-keep-top-rhythm]),
  &[data-scheme='muted']:not([data-rhythm='flush'])
    + &[data-scheme='muted']:not([data-keep-top-rhythm]),
  &[data-scheme='dark']:not([data-rhythm='flush'])
    + &[data-scheme='dark']:not([data-keep-top-rhythm]) {
    padding-top: ${spacing(1.5)};
  }

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

  &[data-full-bleed] {
    max-width: none;
  }
`;

const contentLayerClassName = css`
  position: relative;
  z-index: 1;
`;

export type SectionShellProps = {
  /** Names the `section` landmark, when it has no visible heading to be named by. */
  ariaLabel?: string;
  /** A decorative layer behind the content (halftone, crosshair), hidden from screen readers. Capped at the content width unless `fullBleedBackground` is set. */
  background?: ReactNode;
  children: ReactNode;
  /** Lets the section above overflow into this one: that section becomes visible-overflow and is raised above it. */
  connectsUp?: boolean;
  /** Removes the `Container` gutter, so the content runs edge to edge. */
  flushInline?: boolean;
  /** Lets the `background` layer span the full width instead of the content width. */
  fullBleedBackground?: boolean;
  /** Keeps the full top spacing when the section follows another of the same scheme. Without it, two same-scheme sections in a row close the gap between them. */
  keepsTopRhythm?: boolean;
  /** The vertical spacing, from `RHYTHM`: `section` by default, `hero` and `spacious` for more room, `flush` for none. */
  rhythm?: 'section' | 'hero' | 'spacious' | 'flush';
  /** The color scheme of the section: `light`, `muted` or `dark`. Every component inside follows it, with no prop of its own. */
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
      data-menu-surface=""
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
