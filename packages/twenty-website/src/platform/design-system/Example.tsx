'use client';

import { styled } from '@linaria/react';
import { useState, type ReactNode } from 'react';

import {
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
  type Scheme,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

const Root = styled.div`
  padding-block: ${spacing(8)};
  scroll-margin-top: ${spacing(28)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Box = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  // clip, not hidden: hidden makes a scroll box and breaks the sticky
  // parts of the sections shown inside (steppers).
  overflow: clip;
`;

const Stage = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(4)};
  padding: ${spacing(8)} ${spacing(6)};
`;

const CodeBar = styled.div`
  border-top: 1px solid ${semanticColor.line};
`;

const CodeActions = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Toggle = styled.button`
  background: none;
  border: none;
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  padding: ${spacing(2)} ${spacing(4)};
  text-transform: uppercase;

  &:hover,
  &:focus-visible {
    color: ${semanticColor.ink};
  }
`;

const Pre = styled.pre`
  border-top: 1px solid ${semanticColor.line};
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  overflow-x: auto;
  padding: ${spacing(4)};
`;

export function Example({
  id,
  title,
  description,
  scheme,
  code,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  scheme: Scheme;
  code: string;
  children: ReactNode;
}) {
  const [showsCode, setShowsCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => setShowsCode(true),
    );
  };

  return (
    <Root id={id}>
      <Heading as="h2" family="sans" size="xs">
        {title}
      </Heading>
      {description ? (
        <Body muted size="sm">
          {description}
        </Body>
      ) : null}
      <Box>
        <SectionShell flushInline rhythm="flush" scheme={scheme}>
          <Stage>{children}</Stage>
        </SectionShell>
        <CodeBar>
          <CodeActions>
            <Toggle
              aria-expanded={showsCode}
              type="button"
              onClick={() => setShowsCode(!showsCode)}
            >
              {showsCode ? 'Hide code' : 'Show code'}
            </Toggle>
            <Toggle type="button" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </Toggle>
          </CodeActions>
          {showsCode ? (
            <Pre>
              <code>{code}</code>
            </Pre>
          ) : null}
        </CodeBar>
      </Box>
    </Root>
  );
}
