'use client';

import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { spacing } from '@/tokens';
import { Body, Heading } from '@/ui';

import COMPONENT_DOCS from './component-docs.json';
import { DocPage } from './DocPage';
import { toPageSlug } from './page-slug';
import { Table } from './Table';
import { TableScroll } from './TableScroll';

const Intro = styled.header`
  max-width: ${spacing(180)};
  padding-bottom: ${spacing(10)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

export function PagesIndexPage() {
  const routes = COMPONENT_DOCS.pages.filter((page) => !page.layout);

  return (
    <DocPage>
      <Intro>
        <Heading as="h1" size="lg">
          Pages
        </Heading>
        <Body muted>
          {`The ${routes.length} routes of app/[locale]/(site), and the sections each one places, in order. Every page also gets the layout's sections.`}
        </Body>
      </Intro>
      <TableScroll>
        <Table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Sections, in order</th>
            </tr>
          </thead>
          <tbody>
            {COMPONENT_DOCS.pages.map((page) => (
              <tr key={page.route}>
                <td>
                  <LocalizedLink
                    href={`/design-system/pages/${toPageSlug(page.route)}`}
                  >
                    {page.route === '/*' ? 'Layout (every page)' : page.route}
                  </LocalizedLink>
                </td>
                <td>
                  {page.sections.map((section) => section.name).join(' · ') ||
                    '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>
    </DocPage>
  );
}
