'use client';

import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { fontFamily, fontSize, radius, semanticColor, spacing } from '@/tokens';
import { Body, Heading } from '@/ui';

import COMPONENT_DOCS from './component-docs.json';
import { toComponentSlug } from './component-slug';
import { DocSectionRoot } from './DocSectionRoot';

type Behavior = (typeof COMPONENT_DOCS.components)[number]['behavior'];

const Cards = styled.ul`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: repeat(auto-fill, minmax(${spacing(50)}, 1fr));
  list-style: none;

  & a {
    border: 1px solid ${semanticColor.line};
    border-radius: ${radius(2)};
    color: ${semanticColor.ink};
    display: block;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    padding: ${spacing(4)};
    text-decoration: none;
  }

  & a:hover {
    border-color: ${semanticColor.lineStrong};
  }

  & span {
    color: ${semanticColor.inkMuted};
    display: block;
    font-size: ${fontSize(3.25)};
    margin-top: ${spacing(1)};
  }
`;

const nameOf = (file: string) =>
  file.replace(/^ui\//, '').replace(/\.tsx$/, '');

export function RelatedSection({
  behavior,
  usedBy,
}: {
  behavior: Behavior;
  usedBy: string[];
}) {
  const related = [
    ...behavior.uses.map((name) => ({ name, relation: 'Used inside' })),
    ...usedBy.map((file) => ({
      name: nameOf(file),
      relation: 'Uses this one',
    })),
  ];
  return (
    <DocSectionRoot id="related">
      <Heading as="h2" family="sans" size="sm">
        Related
      </Heading>
      {related.length === 0 ? (
        <Body muted size="sm">
          No other component of src/ui uses it or is used by it.
        </Body>
      ) : (
        <Cards>
          {related.map((entry) => (
            <li key={`${entry.relation}-${entry.name}`}>
              <LocalizedLink
                href={`/design-system/components/${toComponentSlug(entry.name)}`}
              >
                {entry.name}
                <span>{entry.relation}</span>
              </LocalizedLink>
            </li>
          ))}
        </Cards>
      )}
    </DocSectionRoot>
  );
}
