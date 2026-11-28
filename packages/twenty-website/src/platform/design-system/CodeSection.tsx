'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  color,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading } from '@/ui';

import COMPONENT_DOCS from './component-docs.json';
import { DocSectionRoot } from './DocSectionRoot';
import { SOURCE_URL } from './source-url';

type ComponentCode = (typeof COMPONENT_DOCS.components)[number]['code'];
type Declaration = ComponentCode['parts'][number]['declarations'][number];

const Part = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  overflow: clip;
`;

const PartHead = styled.div`
  align-items: baseline;
  border-bottom: 1px solid ${semanticColor.line};
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  gap: ${spacing(3)};
  justify-content: space-between;
  padding: ${spacing(3)} ${spacing(4)};

  & span {
    color: ${semanticColor.inkSubtle};
  }

  & a {
    color: ${semanticColor.inkMuted};
    text-decoration: none;
  }

  & a:hover {
    color: ${semanticColor.ink};
  }
`;

// One declaration: verdict mark, property, value, what to do, its line.
const Row = styled.div`
  align-items: baseline;
  border-top: 1px solid ${semanticColor.line};
  color: ${semanticColor.ink};
  display: grid;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  gap: ${spacing(3)};
  grid-template-columns: ${spacing(4)} ${spacing(44)} minmax(0, 1fr) auto;
  padding: ${spacing(2)} ${spacing(4)};

  &:first-of-type {
    border-top: none;
  }

  &:hover {
    background: ${semanticColor.line};
  }

  & [data-mark] {
    color: ${semanticColor.inkSubtle};
  }

  & [data-mark='token'] {
    color: ${color('green')};
  }

  & [data-mark='decide'] {
    color: ${color('yellow')};
  }

  & [data-mark='fix'] {
    color: ${color('error')};
  }

  & [data-note] strong {
    color: ${semanticColor.ink};
    font-weight: 500;
  }

  & [data-note] {
    color: ${semanticColor.inkMuted};
    display: block;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.25)};
    margin-top: ${spacing(1)};
  }

  & a {
    color: ${semanticColor.inkMuted};
    text-decoration: none;
  }

  & a:hover {
    color: ${semanticColor.ink};
  }

  & button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font: inherit;
    padding: 0;
    text-align: left;
  }

  & button:hover {
    text-decoration: underline;
  }
`;

const Parts = styled.div`
  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const Toggle = styled.button`
  background: none;
  border: none;
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};
  padding: 0;
  text-decoration: underline;
`;

const VERDICTS = [
  { verdict: 'fix', title: 'Fix now', hint: 'Same result, from a token.' },
  {
    verdict: 'decide',
    title: 'Decide with the design owner',
    hint: 'No token matches: round it, add one, or keep it.',
  },
  {
    verdict: 'keep',
    title: 'Keep as is',
    hint: 'Hairlines, layout geometry, local stacking: no token expected.',
  },
] as const;

// What to do first: every value written by hand, sorted by verdict.
const Plan = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: grid;

  & > div {
    padding: ${spacing(4)};
  }

  & > div + div {
    border-top: 1px solid ${semanticColor.line};
  }

  & h3 {
    align-items: baseline;
    color: ${semanticColor.ink};
    display: flex;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    font-weight: 500;
    gap: ${spacing(2)};
  }

  & h3 span {
    color: ${semanticColor.inkSubtle};
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
  }

  & p {
    color: ${semanticColor.inkMuted};
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.25)};
    margin-top: ${spacing(1)};
  }

  & ul {
    list-style: none;
    margin-top: ${spacing(3)};
  }

  & li + li {
    margin-top: ${spacing(3)};
  }

  & li button {
    background: none;
    border: none;
    color: ${semanticColor.ink};
    cursor: pointer;
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
    padding: 0;
    text-align: left;
  }

  & li button:hover {
    text-decoration: underline;
  }

  & li span {
    color: ${semanticColor.inkMuted};
    display: block;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.25)};
    margin-top: ${spacing(0.5)};
  }

  & [data-verdict='fix'] h3::before,
  & [data-verdict='decide'] h3::before,
  & [data-verdict='keep'] h3::before {
    border-radius: ${radius(1)};
    content: '';
    height: ${spacing(2)};
    width: ${spacing(2)};
  }

  & [data-verdict='fix'] h3::before {
    background: ${color('error')};
  }

  & [data-verdict='decide'] h3::before {
    background: ${color('yellow')};
  }

  & [data-verdict='keep'] h3::before {
    background: ${semanticColor.lineStrong};
  }

  ${mediaUp('md')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));

    & > div + div {
      border-left: 1px solid ${semanticColor.line};
      border-top: none;
    }
  }
`;

const markOfVerdict = (declaration: Declaration) =>
  declaration.kind === 'token'
    ? 'token'
    : (declaration.advice?.verdict ?? 'none');

const MARKS_BY_VERDICT: Record<string, string> = {
  token: '✓',
  fix: '✕',
  decide: '!',
  keep: '·',
  none: '·',
};

// Every styled part of the component as the code writes it. By default only
// what is written by hand; a click on a property flashes its part in the preview.
export function CodeSection({
  code,
  file,
  onFlash,
  onOpenLine,
}: {
  code: ComponentCode;
  file: string;
  onFlash: (part: string) => void;
  onOpenLine: (line: number) => void;
}) {
  const [showsAll, setShowsAll] = useState(false);
  const declarations = code.parts.flatMap((part) => part.declarations);
  const tokenCount = declarations.filter(
    (declaration) => declaration.kind === 'token',
  ).length;
  const handCount = declarations.length - tokenCount;
  const fileName = file.replace(/^ui\//, '');

  return (
    <DocSectionRoot id="code">
      <Heading as="h2" family="sans" size="sm">
        Code
      </Heading>
      <Body muted size="sm">
        {`${tokenCount} values go through a token, ${handCount} are written by hand. A click on a property shows its part in the preview; a click on a line number opens the source there.`}
      </Body>
      {handCount > 0 ? (
        <Plan aria-label="What to do">
          {VERDICTS.map(({ verdict, title, hint }) => {
            const items = code.parts.flatMap((part) =>
              part.declarations
                .filter(
                  (declaration) => declaration.advice?.verdict === verdict,
                )
                .map((declaration) => ({ part: part.part, declaration })),
            );
            return (
              <div key={verdict} data-verdict={verdict}>
                <h3>
                  {title}
                  <span>{items.length}</span>
                </h3>
                <p>{hint}</p>
                {verdict === 'keep' || items.length === 0 ? null : (
                  <ul>
                    {items.map(({ part, declaration }) => (
                      <li key={`${declaration.property}-${declaration.line}`}>
                        <button
                          title="Open the source at this line"
                          type="button"
                          onClick={() => {
                            onFlash(part);
                            if (declaration.line) onOpenLine(declaration.line);
                          }}
                        >
                          {declaration.property}: {declaration.value}
                          {declaration.line ? ` :${declaration.line}` : ''}
                        </button>
                        <span>
                          {[
                            declaration.advice?.action,
                            ...(declaration.advice?.options ?? []).map(
                              (option) => `Or: ${option.label}`,
                            ),
                          ]
                            .map((sentence) => sentence?.replace(/\.?$/, '.'))
                            .join(' ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </Plan>
      ) : null}
      {code.parts.length === 0 ? (
        <Body muted size="sm">
          No styled part in this file.
        </Body>
      ) : (
        <Parts>
          {code.parts.map((part) => {
            const shown = showsAll
              ? part.declarations
              : part.declarations.filter(
                  (declaration) => declaration.kind !== 'token',
                );
            if (shown.length === 0) return null;
            return (
              <Part key={part.part}>
                <PartHead>
                  <div>
                    {part.part}
                    <span>
                      {' '}
                      ·{' '}
                      {
                        part.declarations.filter(
                          (declaration) => declaration.kind === 'token',
                        ).length
                      }{' '}
                      token
                    </span>
                  </div>
                  <a href={`${SOURCE_URL}${file}#L${part.line}`}>
                    {fileName}:{part.line} ↗
                  </a>
                </PartHead>
                {shown.map((declaration) => {
                  const advice = declaration.advice;
                  return (
                    <Row key={`${declaration.property}-${declaration.line}`}>
                      <span data-mark={markOfVerdict(declaration)}>
                        {MARKS_BY_VERDICT[markOfVerdict(declaration)]}
                      </span>
                      <button
                        title="Show this part in the preview"
                        type="button"
                        onClick={() => onFlash(part.part)}
                      >
                        {declaration.property}
                      </button>
                      <span>
                        {declaration.value}
                        {advice ? (
                          <span data-note="">
                            <strong>{advice.action}</strong> {advice.effect}
                            {declaration.rule ? ` · ${declaration.rule}` : ''}
                          </span>
                        ) : null}
                      </span>
                      {declaration.line ? (
                        <button
                          title="Open the source at this line"
                          type="button"
                          onClick={() => onOpenLine(declaration.line as number)}
                        >
                          :{declaration.line}
                        </button>
                      ) : (
                        <span />
                      )}
                    </Row>
                  );
                })}
              </Part>
            );
          })}
        </Parts>
      )}
      <Toggle type="button" onClick={() => setShowsAll(!showsAll)}>
        {showsAll
          ? 'Show only what is written by hand'
          : `Also show the ${tokenCount} values that go through a token`}
      </Toggle>
    </DocSectionRoot>
  );
}
