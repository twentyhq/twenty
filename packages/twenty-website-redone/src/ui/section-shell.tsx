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

// The only place a <section> exists. Every section gets identical vertical
// rhythm from tokens and resolves its semantic colors from its scheme — no
// per-section padding, no compact variants, no background props.
const sectionShellClassName = css`
  background-color: ${semanticColor.surface};
  color: ${semanticColor.ink};
  padding-block: ${spacing(RHYTHM.section.base)};
  width: 100%;

  ${mediaUp('md')} {
    padding-block: ${spacing(RHYTHM.section.md)};
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
`;

export type SectionShellProps = {
  ariaLabel?: string;
  children: ReactNode;
  scheme?: Scheme;
};

export function SectionShell({
  ariaLabel,
  children,
  scheme = 'light',
}: SectionShellProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={sectionShellClassName}
      data-scheme={scheme}
    >
      <Container>{children}</Container>
    </section>
  );
}
