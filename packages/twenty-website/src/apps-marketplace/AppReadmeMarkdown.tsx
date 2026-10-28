import { styled } from '@linaria/react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { RichText } from '@/ui';

const Prose = styled.div`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  overflow-wrap: anywhere;

  &[data-size='sm'] {
    ${typeRampDeclarations('bodySm')}
  }

  &[data-size='xs'] {
    ${typeRampDeclarations('bodyXs')}
  }

  &[data-tone='ink'] {
    color: ${semanticColor.ink};
  }

  & > * + * {
    margin-top: ${spacing(3)};
  }

  & > * + h3,
  & > * + h4 {
    margin-top: ${spacing(6)};
  }

  & strong,
  & h3,
  & h4 {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  & h3 {
    font-size: ${fontSize(4.5)};
  }

  & ul,
  & ol {
    padding-left: ${spacing(5)};
  }

  & li + li {
    margin-top: ${spacing(1)};
  }

  & code {
    color: ${semanticColor.ink};
    font-family: ${fontFamily('mono')};
    font-size: 0.9em;
  }

  & pre,
  & table {
    border: 1px solid ${semanticColor.line};
    border-radius: ${radius(2)};
    display: block;
    max-width: 100%;
    overflow-x: auto;
  }

  & pre {
    padding: ${spacing(3)} ${spacing(4)};
  }

  & table {
    border-collapse: collapse;
  }

  & th,
  & td {
    border-bottom: 1px solid ${semanticColor.line};
    padding: ${spacing(2)} ${spacing(3)};
    text-align: left;
    vertical-align: top;
  }

  & th {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  & a {
    color: ${color('blue')};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

type AppReadmeMarkdownProps = {
  markdown: string;
  size?: 'sm' | 'xs';
  tone?: 'muted' | 'ink';
};

export function AppReadmeMarkdown({
  markdown,
  size = 'sm',
  tone = 'muted',
}: AppReadmeMarkdownProps) {
  return (
    <Prose data-size={size} data-tone={tone}>
      <RichText markdown={markdown} />
    </Prose>
  );
}
