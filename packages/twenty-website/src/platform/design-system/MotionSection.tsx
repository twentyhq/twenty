'use client';

import { Body, Heading } from '@/ui';

import { Code } from './Code';
import COMPONENT_DOCS from './component-docs.json';
import { DocSectionRoot } from './DocSectionRoot';
import { Table } from './Table';
import { TableScroll } from './TableScroll';

type Behavior = (typeof COMPONENT_DOCS.components)[number]['behavior'];

export function MotionSection({ behavior }: { behavior: Behavior }) {
  return (
    <DocSectionRoot id="motion">
      <Heading as="h2" family="sans" size="sm">
        Motion
      </Heading>
      {behavior.motion.length === 0 ? (
        <Body muted size="sm">
          No transition or animation in the code.
        </Body>
      ) : (
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th>Part</th>
                <th>Property</th>
                <th>Value</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {behavior.motion.map((entry) => (
                <tr key={`${entry.part}-${entry.property}-${entry.value}`}>
                  <td>
                    <Code>{entry.part}</Code>
                  </td>
                  <td>
                    <Code>{entry.property}</Code>
                  </td>
                  <td>
                    <Code>{entry.value}</Code>
                  </td>
                  <td>
                    {entry.kind === 'token'
                      ? 'Token'
                      : entry.kind === 'hand'
                        ? 'Written by hand'
                        : 'CSS keyword'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      )}
      <Body muted size="sm">
        {behavior.reducedMotion
          ? 'Reduced motion: handled, the file imports REDUCED_MOTION.'
          : behavior.motion.length
            ? 'Reduced motion: not handled, the file does not import REDUCED_MOTION.'
            : 'Reduced motion: nothing to reduce.'}
      </Body>
    </DocSectionRoot>
  );
}
