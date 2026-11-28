'use client';

import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { semanticColor, spacing } from '@/tokens';
import { Body, Eyebrow, Heading } from '@/ui';

const SectionRoot = styled.div`
  border-top: 1px solid ${semanticColor.line};
  padding-block: ${spacing(12)};

  &[data-page] {
    border-top: none;
    padding-top: 0;
  }

  scroll-margin-top: ${spacing(29)};

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const SectionHead = styled.header`
  max-width: ${spacing(160)};

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

export function DocSection({
  id,
  eyebrow,
  title,
  intro,
  asPage = false,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  // On its own page the section is the page: h1, no rule above, no eyebrow.
  asPage?: boolean;
  children: ReactNode;
}) {
  return (
    <SectionRoot data-page={asPage ? '' : undefined} id={id}>
      <SectionHead>
        {asPage ? null : <Eyebrow>{eyebrow}</Eyebrow>}
        {asPage ? (
          <Heading as="h1" size="lg">
            {title}
          </Heading>
        ) : (
          <Heading as="h2" family="sans" size="sm">
            {title}
          </Heading>
        )}
        {intro ? (
          <Body muted size="sm">
            {intro}
          </Body>
        ) : null}
      </SectionHead>
      {children}
    </SectionRoot>
  );
}
