'use client';

import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { fontFamily, fontSize, radius, semanticColor, spacing } from '@/tokens';
import { Body, Heading } from '@/ui';

import { ComponentIndex } from './ComponentIndex';
import { DocPage } from './DocPage';
import { DocSection } from './DocSection';
import { FOUNDATION_TOPICS } from './foundation-topics';

const TOC = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'index', label: 'Components' },
];

const Intro = styled.header`
  max-width: ${spacing(180)};
  padding-bottom: ${spacing(12)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Cards = styled.ul`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: repeat(auto-fill, minmax(${spacing(50)}, 1fr));
  list-style: none;
`;

const Card = styled(LocalizedLink)`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  display: block;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  padding: ${spacing(4)};
  text-decoration: none;

  &:hover,
  &:focus-visible {
    border-color: ${semanticColor.lineStrong};
  }
`;

export function DesignSystemPage() {
  return (
    <DocPage toc={TOC}>
      <Intro>
        <Heading as="h1" size="lg">
          twenty.com design system
        </Heading>
        <Body muted>
          Rendered from src/tokens and src/ui by the site itself, on the main
          branch. What you see here is what ships.
        </Body>
      </Intro>
      <DocSection
        eyebrow="Values"
        id="foundations"
        intro="The tokens every component and section reads."
        title="Foundations"
      >
        <Cards>
          {FOUNDATION_TOPICS.map((topic) => (
            <li key={topic.slug}>
              <Card href={`/design-system/foundations/${topic.slug}`}>
                {topic.label}
              </Card>
            </li>
          ))}
        </Cards>
      </DocSection>
      <ComponentIndex />
    </DocPage>
  );
}
