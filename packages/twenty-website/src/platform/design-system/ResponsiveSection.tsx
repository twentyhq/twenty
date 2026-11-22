'use client';

import { styled } from '@linaria/react';

import { BREAKPOINT_PX, spacing, type Breakpoint } from '@/tokens';
import { Body, Heading } from '@/ui';

import { Code } from './Code';
import COMPONENT_DOCS from './component-docs.json';
import { DocSectionRoot } from './DocSectionRoot';

type Behavior = (typeof COMPONENT_DOCS.components)[number]['behavior'];

const Bullets = styled.ul`
  padding-left: ${spacing(5)};

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

export function ResponsiveSection({ behavior }: { behavior: Behavior }) {
  return (
    <DocSectionRoot id="responsive">
      <Heading as="h2" family="sans" size="sm">
        Responsive behavior
      </Heading>
      {behavior.breakpoints.length === 0 ? (
        <Body muted size="sm">
          No breakpoint in the code: the same layout at every width.
        </Body>
      ) : (
        <Bullets>
          {behavior.breakpoints.map((breakpoint) => (
            <li key={breakpoint}>
              <Body size="sm">
                Changes from <Code>mediaUp(&apos;{breakpoint}&apos;)</Code>,{' '}
                {BREAKPOINT_PX[breakpoint as Breakpoint]} px and up.
              </Body>
            </li>
          ))}
        </Bullets>
      )}
    </DocSectionRoot>
  );
}
