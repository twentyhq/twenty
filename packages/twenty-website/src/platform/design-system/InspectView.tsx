'use client';

import { styled } from '@linaria/react';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  Z_INDEX,
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { SOURCE_URL } from './source-url';
import { XRay } from './XRay';

export type Problem = {
  file: string;
  line: number;
  styled: string | null;
  property: string;
  value: string;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  fix: string | null;
  solutions: { label: string; effect: string }[];
  declarations:
    | { property: string; value: string; byHand: boolean; kind: string }[]
    | null;
  illustration: boolean;
};

type Severity = Problem['severity'];
const SEVERITIES: { id: Severity; label: string }[] = [
  { id: 'error', label: 'Errors' },
  { id: 'warning', label: 'Warnings' },
  { id: 'info', label: 'Info' },
];
const SEVERITY_HINTS: Record<Severity, string> = {
  error: 'A token exists and the code writes the value by hand.',
  warning: 'The value is outside the token scale.',
  info: 'No token can hold it: sizes, 1px rules, local stacking.',
};
const SEVERITY_COLORS: Record<Severity, string> = {
  error: color('error'),
  warning: color('yellow'),
  info: semanticColor.inkSubtle,
};

const Stage = styled.div`
  min-height: 100vh;
`;

const Launcher = styled.button`
  align-items: center;
  background: ${color('black')};
  border: none;
  border-radius: ${radius(2)};
  bottom: ${spacing(4)};
  color: ${color('white')};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(3)};
  padding: ${spacing(3)} ${spacing(4)};
  position: fixed;
  right: ${spacing(4)};
  z-index: ${Z_INDEX.portal};
`;

const Count = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${spacing(1)};

  &::before {
    background: var(--severity-color);
    border-radius: ${radius(100)};
    content: '';
    height: ${spacing(2)};
    width: ${spacing(2)};
  }
`;

const Drawer = styled.aside`
  background: ${color('white')};
  border-left: 1px solid ${color('black-10')};
  bottom: 0;
  color: ${color('black')};
  display: flex;
  flex-direction: column;
  font-family: ${fontFamily('sans')};
  max-width: 100vw;
  position: fixed;
  right: 0;
  top: 0;
  width: ${spacing(120)};
  z-index: ${Z_INDEX.portal};
`;

const DrawerHead = styled.header`
  border-bottom: 1px solid ${color('black-10')};
  padding: ${spacing(4)};

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const TitleRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${spacing(3)};
  justify-content: space-between;

  & h1 {
    font-size: ${fontSize(4.5)};
    font-weight: inherit;
  }

  & a,
  & button {
    background: none;
    border: none;
    color: ${color('black-60')};
    cursor: pointer;
    font: inherit;
    font-size: ${fontSize(3.25)};
  }
`;

const Note = styled.p`
  color: ${color('black-60')};
  font-size: ${fontSize(3.25)};
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};

  & label {
    align-items: center;
    border: 1px solid ${color('black-10')};
    border-radius: ${radius(2)};
    cursor: pointer;
    display: inline-flex;
    font-size: ${fontSize(3.25)};
    gap: ${spacing(1.5)};
    padding: ${spacing(1)} ${spacing(2)};
  }
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: ${spacing(10)};
`;

const FileHead = styled.h2`
  background: ${color('black-5')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: inherit;
  padding: ${spacing(2)} ${spacing(4)};
  position: sticky;
  top: 0;

  & a {
    color: ${color('black')};
  }

  & span {
    color: ${color('black-60')};
  }
`;

const Row = styled.button`
  background: none;
  border: none;
  border-bottom: 1px solid ${color('black-5')};
  color: inherit;
  cursor: pointer;
  display: grid;
  font: inherit;
  gap: ${spacing(1)};
  grid-template-columns: ${spacing(2)} minmax(0, 1fr);
  padding: ${spacing(2.5)} ${spacing(4)};
  text-align: left;
  width: 100%;

  &:hover,
  &:focus-visible {
    background: ${color('black-5')};
  }

  & > i {
    background: var(--severity-color);
    border-radius: ${radius(100)};
    height: ${spacing(2)};
    margin-top: ${spacing(1.5)};
    width: ${spacing(2)};
  }
`;

const RowBody = styled.span`
  display: block;
  font-size: ${fontSize(3.25)};

  & > span,
  & > code {
    display: block;
  }

  & > * + * {
    margin-top: ${spacing(0.5)};
  }

  & code {
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
    overflow-wrap: anywhere;
  }

  & small {
    color: ${color('black-60')};
    display: block;
    font-size: ${fontSize(3)};
  }
`;

const Detail = styled.div`
  background: ${color('black-5')};
  border-bottom: 1px solid ${color('black-10')};
  font-size: ${fontSize(3.25)};
  padding: ${spacing(3)} ${spacing(4)} ${spacing(4)} ${spacing(7)};

  & > * + * {
    margin-top: ${spacing(4)};
  }

  & h3 {
    color: ${color('black-60')};
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
    font-weight: inherit;
    margin-bottom: ${spacing(1.5)};
    text-transform: uppercase;
  }

  & table {
    border-collapse: collapse;
    width: 100%;
  }

  & td {
    border-top: 1px solid ${color('black-10')};
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
    padding: ${spacing(1)} ${spacing(2)} ${spacing(1)} 0;
    vertical-align: top;
  }

  & ol {
    list-style: none;

    & > li + li {
      margin-top: ${spacing(2)};
    }
  }

  & li > span {
    color: ${color('black-60')};
    display: block;
  }

  & button {
    background: ${color('black')};
    border: none;
    border-radius: ${radius(2)};
    color: ${color('white')};
    cursor: pointer;
    font: inherit;
    padding: ${spacing(1)} ${spacing(2.5)};
  }
`;

const RULE_CLASS = 'data-inspect-highlight';

const rowKey = (problem: Problem) =>
  `${problem.file}:${problem.line}:${problem.property}:${problem.value}`;

// Elements rendered by a styled component: Linaria prefixes their class with
// the component's name (Name_hash), in development.
const elementsOf = (stage: HTMLElement, styledName: string) =>
  [...stage.querySelectorAll<HTMLElement>(`[class*="${styledName}_"]`)].filter(
    (element) =>
      [...element.classList].some((name) => name.startsWith(`${styledName}_`)),
  );

export function InspectView({
  title,
  docHref,
  note,
  problems,
  children,
}: {
  title: string;
  docHref: string;
  note: string;
  problems: Problem[];
  children: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [shown, setShown] = useState<Record<Severity, boolean>>({
    error: true,
    warning: true,
    info: false,
  });
  const [withIllustrations, setWithIllustrations] = useState(false);
  const [onPage, setOnPage] = useState<Record<string, number>>({});
  const [openRow, setOpenRow] = useState<string | null>(null);

  // Counting rendered elements needs the DOM once the page is drawn.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const names = [
      ...new Set(problems.map((problem) => problem.styled).filter(Boolean)),
    ] as string[];
    setOnPage(
      Object.fromEntries(
        names.map((name) => [name, elementsOf(stage, name).length]),
      ),
    );
  }, [problems]);

  const clearHighlight = () => {
    for (const element of document.querySelectorAll<HTMLElement>(
      `[${RULE_CLASS}]`,
    )) {
      element.style.outline = '';
      element.removeAttribute(RULE_CLASS);
    }
  };
  const highlight = (problem: Problem, scroll: boolean) => {
    clearHighlight();
    const stage = stageRef.current;
    if (!stage || !problem.styled) return;
    const elements = elementsOf(stage, problem.styled);
    for (const element of elements) {
      element.setAttribute(RULE_CLASS, '');
      element.style.outline = `${spacing(0.5)} solid ${SEVERITY_COLORS[problem.severity]}`;
    }
    if (scroll) elements[0]?.scrollIntoView({ block: 'center' });
  };

  const visible = problems.filter(
    (problem) =>
      shown[problem.severity] && (withIllustrations || !problem.illustration),
  );
  const byFile = new Map<string, Problem[]>();
  for (const problem of visible)
    byFile.set(problem.file, [...(byFile.get(problem.file) ?? []), problem]);
  const counted = (severity: Severity) =>
    problems.filter(
      (problem) =>
        problem.severity === severity &&
        (withIllustrations || !problem.illustration),
    ).length;

  return (
    <>
      <Stage ref={stageRef} data-xray-stage="">
        {children}
      </Stage>
      {open ? (
        <Drawer aria-label="Problems">
          <DrawerHead>
            <TitleRow>
              <h1>{title}</h1>
              <span>
                <LocalizedLink href={docHref}>Doc</LocalizedLink>{' '}
                <button type="button" onClick={() => setOpen(false)}>
                  Close
                </button>
              </span>
            </TitleRow>
            <Note>{note}</Note>
            <Filters>
              {SEVERITIES.map((severity) => (
                <label
                  key={severity.id}
                  title={SEVERITY_HINTS[severity.id]}
                  style={
                    {
                      '--severity-color': SEVERITY_COLORS[severity.id],
                    } as CSSProperties
                  }
                >
                  <input
                    checked={shown[severity.id]}
                    type="checkbox"
                    onChange={() =>
                      setShown({
                        ...shown,
                        [severity.id]: !shown[severity.id],
                      })
                    }
                  />
                  <Count>{`${severity.label} ${counted(severity.id)}`}</Count>
                </label>
              ))}
              <label title="Files that draw the app in miniature (aria-hidden, app-preview): their values copy the app on purpose.">
                <input
                  checked={withIllustrations}
                  type="checkbox"
                  onChange={() => setWithIllustrations(!withIllustrations)}
                />
                Illustrations
              </label>
            </Filters>
            <XRay />
          </DrawerHead>
          <List onMouseLeave={clearHighlight}>
            {[...byFile].map(([file, rows]) => (
              <div key={file}>
                <FileHead>
                  <a href={`${SOURCE_URL}${file}`}>{file}</a>{' '}
                  <span>{rows.length}</span>
                </FileHead>
                {rows.map((problem) => (
                  <div key={rowKey(problem)}>
                    <Row
                      aria-expanded={openRow === rowKey(problem)}
                      style={
                        {
                          '--severity-color': SEVERITY_COLORS[problem.severity],
                        } as CSSProperties
                      }
                      type="button"
                      onClick={() => {
                        setOpenRow(
                          openRow === rowKey(problem) ? null : rowKey(problem),
                        );
                        highlight(problem, true);
                      }}
                      onFocus={() => highlight(problem, false)}
                      onMouseEnter={() => highlight(problem, false)}
                    >
                      <i />
                      <RowBody>
                        <span>{problem.rule}</span>
                        <code>
                          {problem.property}
                          {problem.value
                            ? `: ${problem.value.replaceAll('__TOKEN__', '${…}')}`
                            : ''}
                        </code>
                        <small>
                          line {problem.line}
                          {problem.styled
                            ? ` · ${problem.styled} · ${onPage[problem.styled] ?? 0} on the page`
                            : ''}
                        </small>
                      </RowBody>
                    </Row>
                    {openRow === rowKey(problem) ? (
                      <Detail>
                        <div>
                          <h3>See</h3>
                          {problem.styled && onPage[problem.styled] ? (
                            <button
                              type="button"
                              onClick={() => highlight(problem, true)}
                            >
                              {`Show the ${onPage[problem.styled]} on the page`}
                            </button>
                          ) : (
                            <p>
                              Not drawn on this page (or not a styled element).
                            </p>
                          )}
                        </div>
                        {problem.declarations ? (
                          <div>
                            <h3>Understand: {problem.styled}, line by line</h3>
                            <table>
                              <tbody>
                                {problem.declarations.map((declaration) => (
                                  <tr
                                    key={`${declaration.property}-${declaration.value}`}
                                  >
                                    <td>
                                      {declaration.kind === 'hand'
                                        ? '❌'
                                        : declaration.kind === 'token'
                                          ? '✅'
                                          : '·'}
                                    </td>
                                    <td>{declaration.property}</td>
                                    <td>{declaration.value}</td>
                                    <td>
                                      {declaration.kind === 'hand'
                                        ? 'by hand'
                                        : declaration.kind === 'token'
                                          ? 'token'
                                          : 'plain CSS'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}
                        <div>
                          <h3>Fix</h3>
                          {problem.solutions.length ? (
                            <ol>
                              {problem.solutions.map((solution, index) => (
                                <li key={solution.label}>
                                  {index === 0 && problem.solutions.length > 1
                                    ? 'Recommended: '
                                    : ''}
                                  <code>{solution.label}</code>
                                  <span>{solution.effect}</span>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p>
                              {problem.fix
                                ? `Use ${problem.fix}.`
                                : 'No token can hold this value: nothing to fix.'}
                            </p>
                          )}
                        </div>
                        <p>
                          <a
                            href={`${SOURCE_URL}${problem.file}#L${problem.line}`}
                          >{`Open ${problem.file}:${problem.line} on GitHub`}</a>
                        </p>
                      </Detail>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </List>
        </Drawer>
      ) : (
        <Launcher type="button" onClick={() => setOpen(true)}>
          Problems
          {SEVERITIES.map((severity) => (
            <Count
              key={severity.id}
              style={
                {
                  '--severity-color': SEVERITY_COLORS[severity.id],
                } as CSSProperties
              }
            >
              {counted(severity.id)}
            </Count>
          ))}
        </Launcher>
      )}
    </>
  );
}
