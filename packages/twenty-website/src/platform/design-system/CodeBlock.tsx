'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';

import {
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import COMPONENT_SOURCES from './component-sources.json';
import { SOURCE_URL } from './source-url';

export type LineMark = {
  line: number;
  severity: 'error' | 'warning' | 'info';
  note: string;
};

const COLLAPSED_LINES = 18;

const Root = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  overflow: clip;
`;

const Head = styled.div`
  align-items: center;
  border-bottom: 1px solid ${semanticColor.line};
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  gap: ${spacing(4)};
  justify-content: space-between;
  padding: ${spacing(3)} ${spacing(4)};

  & > span {
    color: ${semanticColor.inkMuted};
  }

  & div {
    display: flex;
    gap: ${spacing(4)};
  }

  & a,
  & button {
    background: none;
    border: none;
    color: ${semanticColor.inkMuted};
    cursor: pointer;
    font: inherit;
    padding: 0;
    text-decoration: none;
  }

  & a:hover,
  & button:hover {
    color: ${semanticColor.ink};
  }
`;

const Body = styled.div`
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  max-height: ${spacing(160)};
  overflow: auto;
  padding-block: ${spacing(3)};
`;

// One source line: number, code, and the audit's note when it has one.
const Line = styled.div`
  border-left: 2px solid transparent;
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: ${spacing(10)} max-content;
  min-width: max-content;
  padding-right: ${spacing(4)};

  & > span:first-child {
    color: ${semanticColor.inkSubtle};
    text-align: right;
  }

  & pre {
    font: inherit;
  }

  & [data-kind='k'] {
    color: ${color('pink')};
  }

  & [data-kind='s'] {
    color: ${color('green')};
  }

  & [data-kind='n'] {
    color: ${color('yellow')};
  }

  & [data-kind='c'] {
    color: ${semanticColor.inkSubtle};
  }

  & [data-note] {
    color: ${semanticColor.inkMuted};
    font-family: ${fontFamily('sans')};
    grid-column: 2;
    padding-bottom: ${spacing(1)};
  }

  &[data-severity='error'] {
    background: ${semanticColor.line};
    border-left-color: ${color('error')};
  }

  &[data-severity='warning'] {
    background: ${semanticColor.line};
    border-left-color: ${color('yellow')};
  }

  &[data-severity='info'] {
    border-left-color: ${semanticColor.lineStrong};
  }

  &[data-focused] {
    background: ${semanticColor.lineStrong};
  }
`;

const More = styled.button`
  background: none;
  border: none;
  border-top: 1px solid ${semanticColor.line};
  color: ${semanticColor.ink};
  cursor: pointer;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  padding: ${spacing(3)};
  width: 100%;

  &:hover {
    background: ${semanticColor.line};
  }
`;

// The component's real source, as Arc shows its file: path, copy, line
// numbers, colors from the compiler, and the audit's marks on their lines.
export function CodeBlock({
  file,
  marks,
  focusLine,
}: {
  file: string;
  marks: LineMark[];
  focusLine: number | null;
}) {
  const lines = (COMPONENT_SOURCES as Record<string, string[][][]>)[file] ?? [];
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const focusRef = useRef<HTMLDivElement>(null);
  const markOf = new Map(marks.map((mark) => [mark.line, mark]));
  const showsAll =
    expanded || lines.length <= COLLAPSED_LINES || focusLine !== null;
  const shown = showsAll ? lines : lines.slice(0, COLLAPSED_LINES);

  // Scrolling to a line the page asked for is a reaction to that request
  // arriving, not to a click inside this block.
  useEffect(() => {
    focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusLine]);

  const copy = () => {
    const text = lines
      .map((line) => line.map(([, part]) => part).join(''))
      .join('\n');
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => setCopied(false),
    );
  };

  return (
    <Root>
      <Head>
        <span>src/{file}</span>
        <div>
          <a href={`${SOURCE_URL}${file}`}>GitHub ↗</a>
          <button type="button" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </Head>
      <Body>
        {shown.map((parts, index) => {
          const number = index + 1;
          const mark = markOf.get(number);
          return (
            <Line
              key={number}
              ref={number === focusLine ? focusRef : undefined}
              data-focused={number === focusLine ? '' : undefined}
              data-severity={mark?.severity}
              id={`source-line-${number}`}
            >
              <span>{number}</span>
              <pre>
                {parts
                  .reduce<{ kind: string; part: string; start: number }[]>(
                    (runs, [kind, part]) => {
                      const previous = runs[runs.length - 1];
                      const start = previous
                        ? previous.start + previous.part.length
                        : 0;
                      return runs.concat({ kind, part, start });
                    },
                    [],
                  )
                  .map((run) => (
                    <span key={run.start} data-kind={run.kind}>
                      {run.part}
                    </span>
                  ))}
              </pre>
              {mark ? <span data-note="">{mark.note}</span> : null}
            </Line>
          );
        })}
      </Body>
      {lines.length > COLLAPSED_LINES ? (
        <More type="button" onClick={() => setExpanded(!showsAll)}>
          {showsAll ? 'Show less' : `Show all ${lines.length} lines`}
        </More>
      ) : null}
    </Root>
  );
}
