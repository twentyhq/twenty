import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  semanticColor,
  spacing,
} from '@/tokens';
import { Heading, SectionShell } from '@/ui';

const Column = styled.div`
  margin-inline: auto;
  max-width: 720px;
  width: 100%;
`;

// Long-form legal text is a document, not marketing UI: the content is semantic
// HTML styled by this container (the prose pattern, like the old site's legal
// Article) — no markdown runtime, no per-paragraph primitives.
const Prose = styled.div`
  margin-top: ${spacing(6)};

  & > *:first-child {
    margin-top: 0;
  }

  h2 {
    color: ${semanticColor.ink};
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(6)};
    font-weight: ${FONT_WEIGHT.medium};
    line-height: 1.3;
    margin-top: ${spacing(12)};
  }

  h3 {
    color: ${semanticColor.ink};
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(5)};
    font-weight: ${FONT_WEIGHT.medium};
    line-height: 1.35;
    margin-top: ${spacing(8)};
  }

  p {
    color: ${color('black-80')};
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(4)};
    line-height: 1.65;
    margin-top: ${spacing(4)};
  }

  ul,
  ol {
    color: ${color('black-80')};
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(4)};
    line-height: 1.65;
    margin-top: ${spacing(4)};
    padding-left: ${spacing(6)};
  }

  li {
    margin-top: ${spacing(2)};
  }

  li:first-child {
    margin-top: 0;
  }

  strong {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  em {
    font-style: italic;
  }

  a {
    color: ${color('blue')};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

export function LegalDocument({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <SectionShell rhythm="section" scheme="light">
      <Column>
        <Heading as="h1" size="lg" weight="light">
          {title}
        </Heading>
        <Prose>{children}</Prose>
      </Column>
    </SectionShell>
  );
}
