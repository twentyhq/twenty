'use client';

import { styled } from '@linaria/react';
import { useCallback, useState, type ReactNode } from 'react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading } from '@/ui';

import { Breadcrumb } from './Breadcrumb';
import { Code } from './Code';
import COMPONENT_DOCS from './component-docs.json';
import { toComponentSlug } from './component-slug';
import { DocPage } from './DocPage';
import { DocSection } from './DocSection';
import { FileList } from './FileList';
import { Hint } from './Hint';
import { InfoCard } from './InfoCard';
import { ProblemCount } from './ProblemCount';
import { toPageSlug } from './page-slug';
import { schemeLabel } from './scheme-label';
import { humanName } from './human-name';
import { pageLabel as readablePage } from './page-label';
import { ScaledPreview } from './ScaledPreview';
import { SOURCE_URL } from './source-url';

const Intro = styled.header`
  max-width: ${spacing(180)};
  padding-bottom: ${spacing(8)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Context = styled.p`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: flex;
  flex-wrap: wrap;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(2)} ${spacing(4)};
`;

const PreviewBar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};
  gap: ${spacing(3)};
  justify-content: space-between;
  margin-top: ${spacing(3)};

  & > span {
    color: ${semanticColor.inkMuted};
  }

  & > a {
    border: 1px solid ${semanticColor.line};
    border-radius: ${radius(2)};
    color: ${semanticColor.ink};
    padding: ${spacing(1.5)} ${spacing(3)};
    text-decoration: none;
  }

  & > a:hover {
    border-color: ${semanticColor.lineStrong};
  }
`;

const Points = styled.ul`
  font-family: ${fontFamily('sans')};
  list-style: none;

  & > li {
    border-top: 1px solid ${semanticColor.line};
    display: grid;
    gap: ${spacing(1)} ${spacing(3)};
    grid-template-columns: ${spacing(2)} minmax(0, 1fr);
    padding-block: ${spacing(3)};
  }

  & i {
    border-radius: ${radius(100)};
    height: ${spacing(2)};
    margin-top: ${spacing(1.5)};
    width: ${spacing(2)};
  }

  & i[data-severity='error'] {
    background: ${color('error')};
  }

  & i[data-severity='warning'] {
    background: ${color('yellow')};
  }

  & i[data-severity='note'] {
    background: ${semanticColor.lineStrong};
  }

  & strong {
    font-weight: inherit;
  }

  & small {
    color: ${semanticColor.inkMuted};
    display: block;
    font-size: ${fontSize(3.25)};
    margin-top: ${spacing(0.5)};
  }

  & code {
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
  }
`;

const Details = styled.details`
  & > summary {
    cursor: pointer;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    margin-bottom: ${spacing(4)};
  }
`;

export type Improvement = {
  rule: string;
  severity: 'error' | 'warning';
  count: number;
  first: string;
  // The styled components it concerns: Linaria prefixes their class with it.
  styledNames: string[];
  fix: string | null;
  effect: string | null;
};

const pageLabel = readablePage;

export function SectionPage({
  slug,
  preview,
  previewNote,
  improvements,
}: {
  slug: string;
  preview: ReactNode;
  previewNote: string;
  improvements: Improvement[];
}) {
  const [focus, setFocus] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const onCount = useCallback(
    (next: Record<string, number>) => setCounts(next),
    [],
  );
  const section = COMPONENT_DOCS.sections.find(
    (entry) => toComponentSlug(entry.name) === slug,
  );
  if (!section) return null;
  const countNames = [
    ...new Set(improvements.flatMap((point) => point.styledNames)),
  ];
  const inPreview = (point: Improvement) =>
    point.styledNames.reduce((sum, name) => sum + (counts?.[name] ?? 0), 0);
  // Pages that pass their own scheme, and the section a page nests it in.
  const placements = COMPONENT_DOCS.pages.flatMap((page) =>
    page.sections
      .filter(
        (placed) => placed.name === section.name && placed.dir === section.dir,
      )
      .map((placed) => ({
        route: page.route,
        scheme: placed.scheme,
        inside: placed.inside,
      })),
  );
  const overrides = placements.filter((entry) => entry.scheme !== null);
  const nestedIn = [
    ...new Set(placements.map((entry) => entry.inside).filter(Boolean)),
  ];
  // Where SectionShell cuts its top padding: after a section of the same
  // scheme that is not flush, unless it keeps its top rhythm.
  const sectionData = (name: string, dir: string) =>
    COMPONENT_DOCS.sections.find(
      (entry) => entry.name === name && entry.dir === dir,
    );
  const collapses = COMPONENT_DOCS.pages.flatMap((page) => {
    const placed = page.sections.filter((entry) => entry.inside === null);
    const index = placed.findIndex(
      (entry) => entry.name === section.name && entry.dir === section.dir,
    );
    if (index < 1) return [];
    const previous = placed[index - 1];
    const previousData = sectionData(previous.name, previous.dir);
    const schemeOf = (entry: (typeof placed)[number]) =>
      entry.scheme ?? sectionData(entry.name, entry.dir)?.scheme.value ?? null;
    const scheme = schemeOf(placed[index]);
    const shell = 'shell' in section.scheme ? section.scheme.shell : undefined;
    const previousShell =
      previousData && 'shell' in previousData.scheme
        ? previousData.scheme.shell
        : undefined;
    return scheme !== null &&
      scheme === schemeOf(previous) &&
      previousShell?.rhythm &&
      previousShell.rhythm !== 'flush' &&
      shell?.keepsTopRhythm === false
      ? [{ route: page.route, previous: previous.name, scheme }]
      : [];
  });
  const shared = section.pages.length > 1 || section.pages.includes('/*');
  const groupLabel = shared
    ? 'Shared'
    : section.pages[0]
      ? pageLabel(section.pages[0])
      : 'Not used';
  // Where it sits: its position on its page, for the context line.
  const position = (() => {
    if (shared || !section.pages[0]) return null;
    const page = COMPONENT_DOCS.pages.find(
      (entry) => entry.route === section.pages[0],
    );
    const index =
      page?.sections.findIndex(
        (entry) => entry.name === section.name && entry.dir === section.dir,
      ) ?? -1;
    return page && index >= 0
      ? `Section ${index + 1} of ${page.sections.length} on ${pageLabel(page.route)}`
      : null;
  })();
  // What the structure says, beside the hand-written values.
  const notes = [
    ...(section.pages.length === 0
      ? ['No page uses it: a candidate for removal.']
      : []),
    ...(section.scheme.source === 'data-scheme'
      ? [
          'It sets data-scheme on its own elements instead of rendering a SectionShell: its scheme and spacing escape the section rules.',
        ]
      : []),
    ...(section.scheme.source === 'none' && nestedIn.length === 0
      ? [
          'It renders no SectionShell: it takes no section spacing or scheme of its own.',
        ]
      : []),
    ...nestedIn.map(
      (name) =>
        `Its pages place it inside ${name}, which styles it: content, not a section of its own.`,
    ),
    ...(section.takesContent
      ? ['Its page fills it with content: alone, it renders empty.']
      : []),
    ...(section.requiredProps.length
      ? [`It needs data from its page (${section.requiredProps.join(', ')}).`]
      : []),
    ...collapses.map(
      (entry) =>
        `On ${pageLabel(entry.route)} it follows ${humanName(entry.previous)}, also ${entry.scheme}: SectionShell cuts its top padding (SectionShell.tsx:70-77).`,
    ),
  ];

  return (
    <DocPage
      toc={[
        { id: 'preview', label: 'Preview' },
        { id: 'improve', label: 'To improve' },
        { id: 'details', label: 'Details' },
      ]}
    >
      <Intro>
        <Breadcrumb
          items={[
            { label: 'Sections', href: '/design-system/sections' },
            { label: groupLabel },
          ]}
        />
        <Heading as="h1" size="lg">
          {humanName(section.name)}
        </Heading>
        {section.description ? <Body muted>{section.description}</Body> : null}
        <Context>
          <Code>{section.name}</Code>
          {position ? <span>{position}</span> : null}
          <span>{`Scheme: ${schemeLabel(section.scheme)}`}</span>
          <ProblemCount problems={section.problems} />
        </Context>
      </Intro>
      <div id="preview">
        {preview ? (
          <ScaledPreview
            countNames={countNames}
            focus={focus}
            onCount={onCount}
          >
            {preview}
          </ScaledPreview>
        ) : null}
        <PreviewBar>
          <span>{previewNote}</span>
          <LocalizedLink href={`/design-system/inspect/sections/${slug}`}>
            Inspect at full size →
          </LocalizedLink>
        </PreviewBar>
      </div>
      <DocSection eyebrow="Analysis" id="improve" title="To improve">
        {improvements.length === 0 && notes.length === 0 ? (
          <Hint>
            Nothing to improve: no errors or warnings in its files, and its
            structure follows the section rules.
          </Hint>
        ) : (
          <Points>
            {improvements.map((point) => (
              <li
                key={point.rule}
                tabIndex={point.styledNames.length ? 0 : undefined}
                onBlur={() => setFocus([])}
                onFocus={() => setFocus(point.styledNames)}
                onMouseEnter={() => setFocus(point.styledNames)}
                onMouseLeave={() => setFocus([])}
              >
                <i data-severity={point.severity} />
                <span>
                  <strong>{`${point.rule} · ${point.count}×`}</strong>
                  {point.fix ? (
                    <small>
                      Fix: <code>{point.fix}</code>
                      {point.effect ? ` — ${point.effect}` : ''}
                    </small>
                  ) : null}
                  <small>
                    First at <code>{point.first}</code>
                    {point.styledNames.length && counts
                      ? inPreview(point)
                        ? ` · ${inPreview(point)} in the preview: hover to see them`
                        : ' · not drawn in this preview'
                      : ''}
                  </small>
                </span>
              </li>
            ))}
            {notes.map((note) => (
              <li key={note}>
                <i data-severity="note" />
                <span>{note}</span>
              </li>
            ))}
          </Points>
        )}
      </DocSection>
      <DocSection eyebrow="Code" id="details" title="Details">
        <Details>
          <summary>Pages, scheme, files and components it uses</summary>
          <InfoCard
            footer={
              <>
                Every row is read from the code by
                scripts/generate-design-system-data.mjs. Files open on GitHub,
                main branch.
              </>
            }
            rows={[
              {
                label: 'Appears on',
                value: section.pages.length ? (
                  <FileList>
                    {section.pages.map((route) => (
                      <li key={route}>
                        <LocalizedLink
                          href={`/design-system/pages/${toPageSlug(route)}`}
                        >
                          {pageLabel(route)}
                        </LocalizedLink>
                      </li>
                    ))}
                  </FileList>
                ) : (
                  <Hint>No page places it.</Hint>
                ),
              },
              {
                label: 'Scheme',
                value: (
                  <>
                    <Code>{schemeLabel(section.scheme)}</Code>
                    {overrides.length ? (
                      <Hint>
                        {overrides
                          .map((entry) => `${entry.scheme} on ${entry.route}`)
                          .join(' · ')}
                      </Hint>
                    ) : null}
                  </>
                ),
              },
              ...(nestedIn.length
                ? [
                    {
                      label: 'Placed inside',
                      value: (
                        <FileList>
                          {nestedIn.map((name) => (
                            <li key={name}>
                              <LocalizedLink
                                href={`/design-system/sections/${toComponentSlug(String(name))}`}
                              >
                                {name}
                              </LocalizedLink>
                            </li>
                          ))}
                        </FileList>
                      ),
                    },
                  ]
                : []),
              {
                label: 'Uses from src/ui',
                value: section.uiUsed.length ? (
                  <FileList>
                    {section.uiUsed.map((name) => (
                      <li key={name}>
                        <LocalizedLink
                          href={`/design-system/components/${toComponentSlug(name)}`}
                        >
                          {name}
                        </LocalizedLink>
                      </li>
                    ))}
                  </FileList>
                ) : (
                  <Hint>None.</Hint>
                ),
              },
              {
                label: 'Required props',
                value: section.requiredProps.length ? (
                  <Code>{section.requiredProps.join(', ')}</Code>
                ) : (
                  <Hint>None: it renders the same on every page.</Hint>
                ),
              },
              {
                label: 'Source',
                value: (
                  <a href={`${SOURCE_URL}${section.file}`}>
                    <Code>src/{section.file}</Code>
                  </a>
                ),
              },
              {
                label: 'Folder',
                value: (
                  <details>
                    <summary>
                      {`sections/${section.dir} · ${section.files.length} files`}
                    </summary>
                    <FileList>
                      {section.files.map((file) => (
                        <li key={file}>
                          <a href={`${SOURCE_URL}${file}`}>
                            <Code>{file}</Code>
                          </a>
                        </li>
                      ))}
                    </FileList>
                  </details>
                ),
              },
            ]}
          />
        </Details>
      </DocSection>
    </DocPage>
  );
}
