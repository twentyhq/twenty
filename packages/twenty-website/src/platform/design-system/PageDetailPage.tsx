'use client';

import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { spacing } from '@/tokens';
import { Body, Heading } from '@/ui';

import { Breadcrumb } from './Breadcrumb';
import { Code } from './Code';
import COMPONENT_DOCS from './component-docs.json';
import { toComponentSlug } from './component-slug';
import { DocPage } from './DocPage';
import { DocSection } from './DocSection';
import { Hint } from './Hint';
import { InfoCard } from './InfoCard';
import { InspectLink } from './InspectLink';
import { schemeLabel } from './scheme-label';
import { toPageSlug } from './page-slug';
import { SOURCE_URL } from './source-url';
import { Table } from './Table';
import { TableScroll } from './TableScroll';

const Intro = styled.header`
  max-width: ${spacing(180)};
  padding-bottom: ${spacing(8)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

export function PageDetailPage({ slug }: { slug: string }) {
  const page = COMPONENT_DOCS.pages.find(
    (entry) => toPageSlug(entry.route) === slug,
  );
  if (!page) return null;
  const layout = COMPONENT_DOCS.pages.find((entry) => entry.layout);
  const rows = [
    ...page.sections.map((placed) => ({
      name: placed.name,
      dir: placed.dir,
      scheme: placed.scheme,
      inside: placed.inside,
      from: 'page',
    })),
    ...(page.layout || !layout
      ? []
      : layout.sections.map((placed) => ({
          name: placed.name,
          dir: placed.dir,
          scheme: placed.scheme,
          inside: placed.inside,
          from: 'layout',
        }))),
  ];
  // The scheme the page passes wins over what the section reads by itself.
  const schemeOf = (row: (typeof rows)[number]) => {
    if (row.scheme) return `${row.scheme}, passed by the page`;
    const section = COMPONENT_DOCS.sections.find(
      (entry) => entry.name === row.name && entry.dir === row.dir,
    );
    return section ? schemeLabel(section.scheme) : '—';
  };

  return (
    <DocPage
      toc={[
        { id: 'composition', label: 'Composition' },
        { id: 'inspect', label: 'Inspect' },
      ]}
    >
      <Intro>
        <Breadcrumb
          items={[{ label: 'Pages', href: '/design-system/pages' }]}
        />
        <Heading as="h1" size="lg">
          {page.layout ? 'Layout (every page)' : page.route}
        </Heading>
        <Body muted>
          {page.layout
            ? 'The sections the (site) layout adds around every page.'
            : `${rows.length} sections, in the order the page file places them.`}
        </Body>
      </Intro>
      <InfoCard
        footer="Read from the route file by scripts/generate-design-system-data.mjs."
        rows={[
          {
            label: 'Source',
            value: (
              <a href={`${SOURCE_URL}${page.file}`}>
                <Code>src/{page.file}</Code>
              </a>
            ),
          },
          {
            label: 'Open',
            value:
              !page.layout && !page.dynamic ? (
                <a href={page.route}>{page.route}</a>
              ) : (
                <Hint>
                  {page.dynamic
                    ? 'One URL per entry: open it from its index page.'
                    : 'Not a page of its own.'}
                </Hint>
              ),
          },
        ]}
      />
      <DocSection eyebrow="Order" id="composition" title="Composition">
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th>#</th>
                <th>Section</th>
                <th>Scheme</th>
                <th>Placed by</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, position) => (
                <tr key={`${row.from}/${row.dir}/${row.name}`}>
                  <td>{position + 1}</td>
                  <td>
                    <LocalizedLink
                      href={`/design-system/sections/${toComponentSlug(row.name)}`}
                    >
                      {row.name}
                    </LocalizedLink>
                  </td>
                  <td>
                    <Code>{schemeOf(row)}</Code>
                  </td>
                  <td>
                    {row.inside
                      ? `${row.from}, inside ${row.inside}`
                      : row.from}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </DocSection>
      {page.layout ? null : (
        <DocSection eyebrow="Live" id="inspect" title="Inspect">
          <InspectLink href={`/design-system/inspect/pages/${slug}`} />
        </DocSection>
      )}
    </DocPage>
  );
}
