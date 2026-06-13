import { css } from '@linaria/core';
import { type ReactNode } from 'react';

import {
  buildSchemeDeclarations,
  mediaUp,
  RHYTHM,
  type Scheme,
  semanticColor,
  spacing,
} from '@/tokens';

import { Container } from './container';

// The only place a <section> exists. Every section gets its vertical rhythm
// from a named token class and resolves its semantic colors from its scheme —
// no per-section padding, no background props.
const sectionShellClassName = css`
  background-color: ${semanticColor.surface};
  color: ${semanticColor.ink};
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
    ${buildSchemeDeclarations('light')}
  }

  &[data-scheme='muted'] {
    ${buildSchemeDeclarations('muted')}
  }

  &[data-scheme='dark'] {
    ${buildSchemeDeclarations('dark')}
  }

  /* Same-scheme neighbours share one surface, so the follower trims its top
     to a single small step rather than stacking a second full rhythm band of
     the same colour. The upper section keeps its full bottom rhythm; the
     follower's 6px (not 0) leaves room for frame decorations that overflow its
     top edge — TrustedBy's corner markers. Flush scenes own their own edges
     and opt out. */
  &[data-scheme='light']:not([data-rhythm='flush']) + &[data-scheme='light'],
  &[data-scheme='muted']:not([data-rhythm='flush']) + &[data-scheme='muted'],
  &[data-scheme='dark']:not([data-rhythm='flush']) + &[data-scheme='dark'] {
    padding-top: ${spacing(1.5)};
  }
`;

const backgroundLayerClassName = css`
  inset: 0;
  overflow: clip;
  pointer-events: none;
  position: absolute;
  z-index: 0;
`;

const contentLayerClassName = css`
  position: relative;
  z-index: 1;
`;

export type SectionShellProps = {
  ariaLabel?: string;
  // Decorative full-bleed layer behind the content (gradients, visuals).
  background?: ReactNode;
  children: ReactNode;
  rhythm?: 'section' | 'hero' | 'spacious' | 'flush';
  scheme?: Scheme;
};

export function SectionShell({
  ariaLabel,
  background,
  children,
  rhythm = 'section',
  scheme = 'light',
}: SectionShellProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={sectionShellClassName}
      data-rhythm={rhythm}
      data-scheme={scheme}
    >
      {background !== undefined && (
        <div aria-hidden className={backgroundLayerClassName}>
          {background}
        </div>
      )}
      <Container className={contentLayerClassName}>{children}</Container>
    </section>
  );
}
