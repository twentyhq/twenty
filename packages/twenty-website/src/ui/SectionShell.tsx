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
  ariaLabel?: string;
  background?: ReactNode;
  children: ReactNode;
  connectsUp?: boolean;
  flushInline?: boolean;
  fullBleedBackground?: boolean;
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
