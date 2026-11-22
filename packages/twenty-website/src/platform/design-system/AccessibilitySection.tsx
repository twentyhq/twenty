'use client';

import { Body, Heading } from '@/ui';

import { Code } from './Code';
import COMPONENT_DOCS from './component-docs.json';
import { DocSectionRoot } from './DocSectionRoot';
import { Table } from './Table';
import { TableScroll } from './TableScroll';

type Behavior = (typeof COMPONENT_DOCS.components)[number]['behavior'];

export function AccessibilitySection({ behavior }: { behavior: Behavior }) {
  return (
    <DocSectionRoot id="accessibility">
      <Heading as="h2" family="sans" size="sm">
        Accessibility
      </Heading>
      {behavior.accessibility.length === 0 ? (
        <Body muted size="sm">
          No aria, role or alt attribute written in the component.
        </Body>
      ) : (
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th>Element</th>
                <th>Attribute</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {behavior.accessibility.map((entry) => (
                <tr key={`${entry.tag}-${entry.attribute}-${entry.value}`}>
                  <td>
                    <Code>{entry.tag}</Code>
                  </td>
                  <td>
                    <Code>{entry.attribute}</Code>
                  </td>
                  <td>
                    <Code>{entry.value}</Code>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      )}
    </DocSectionRoot>
  );
}
