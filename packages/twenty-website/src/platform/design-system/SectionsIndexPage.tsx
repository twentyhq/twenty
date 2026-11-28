'use client';

import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { spacing } from '@/tokens';
import { Body, Heading } from '@/ui';

import { Code } from './Code';
import COMPONENT_DOCS from './component-docs.json';
import { toComponentSlug } from './component-slug';
import { DocPage } from './DocPage';
import { ProblemCount } from './ProblemCount';
import { schemeLabel } from './scheme-label';
import { humanName } from './human-name';
import { SECTION_MENU_GROUPS } from './section-menu-groups';
import { SubHead } from './SubHead';
import { Table } from './Table';
import { TableScroll } from './TableScroll';

const Intro = styled.header`
  max-width: ${spacing(180)};
  padding-bottom: ${spacing(10)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Group = styled.div`
  & + & {
    margin-top: ${spacing(10)};
  }

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

export function SectionsIndexPage() {
  const groups = SECTION_MENU_GROUPS.map((group) => ({
    id: group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label: group.title,
    sections: group.sections,
  }));

  return (
    <DocPage
      toc={groups.map((group) => ({ id: group.id, label: group.label }))}
    >
      <Intro>
        <Heading as="h1" size="lg">
          Sections
        </Heading>
        <Body muted>
          {`The ${COMPONENT_DOCS.sections.length} sections of src/sections, the blocks pages are made of. Shared ones first, then each page with its own sections in page order, read from the page files.`}
        </Body>
      </Intro>
      {groups.map((group) => (
        <Group key={group.id} id={group.id}>
          <SubHead>{`${group.label} · ${group.sections.length}`}</SubHead>
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Folder</th>
                  <th>Scheme</th>
                  <th>Pages</th>
                  <th>Problems</th>
                </tr>
              </thead>
              <tbody>
                {group.sections.map((section) => (
                  <tr key={`${section.dir}/${section.name}`}>
                    <td>
                      <LocalizedLink
                        href={`/design-system/sections/${toComponentSlug(section.name)}`}
                      >
                        {humanName(section.name)}
                      </LocalizedLink>
                    </td>
                    <td>
                      <Code>{section.dir}</Code>
                    </td>
                    <td>
                      <Code>{schemeLabel(section.scheme)}</Code>
                    </td>
                    <td>
                      {section.pages.includes('/*')
                        ? 'Every page'
                        : section.pages.join(', ') || '—'}
                    </td>
                    <td>
                      <ProblemCount problems={section.problems} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        </Group>
      ))}
    </DocPage>
  );
}
