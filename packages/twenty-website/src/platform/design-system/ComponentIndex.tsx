'use client';

import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { fontFamily, fontSize, radius, semanticColor, spacing } from '@/tokens';

import COMPONENT_DOCS from './component-docs.json';
import { COMPONENT_REGISTRY } from './component-registry';
import { toComponentSlug } from './component-slug';
import { DocSection } from './DocSection';
import { type ComponentKind } from './KindBadge';
import { ProblemCount } from './ProblemCount';
import { SubHead } from './SubHead';

const GROUPS: { title: string; kinds: ComponentKind[] }[] = [
  { title: 'Elements', kinds: ['component'] },
  { title: 'Sections', kinds: ['section'] },
  { title: 'Layout', kinds: ['layout'] },
  { title: 'Building blocks', kinds: ['internal', 'decor'] },
];

const Group = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Cards = styled.ul`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: repeat(auto-fill, minmax(${spacing(60)}, 1fr));
  list-style: none;
`;

const Card = styled(LocalizedLink)`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${spacing(4)};
  text-decoration: none;

  & > * + * {
    margin-top: ${spacing(2)};
  }

  &:hover,
  &:focus-visible {
    border-color: ${semanticColor.lineStrong};
  }
`;

const Name = styled.span`
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
`;

const Summary = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};
`;

export function ComponentIndex() {
  const components = COMPONENT_DOCS.components
    .map((component) => ({
      name: component.name,
      kind: component.kind as ComponentKind,
      problems: component.problems,
      summary:
        component.description ??
        COMPONENT_REGISTRY.find((entry) => entry.name === component.name)
          ?.summary ??
        null,
    }))
    .toSorted((first, second) => first.name.localeCompare(second.name));

  return (
    <DocSection
      eyebrow="Building blocks of src/ui"
      id="index"
      intro="All of them live in src/ui. They are grouped by what the code shows they are: small elements to use directly, complete sections, spacing-only layout, and the internal pieces and decor other components are built from."
      title={`${components.length} components`}
    >
      {GROUPS.map((group) => {
        const members = components.filter((content) =>
          group.kinds.includes(content.kind),
        );
        return members.length ? (
          <Group key={group.title}>
            <SubHead>
              {group.title} · {members.length}
            </SubHead>
            <Cards>
              {members.map((content) => (
                <li key={content.name}>
                  <Card
                    href={`/design-system/components/${toComponentSlug(content.name)}`}
                  >
                    <Name>{content.name}</Name>
                    <Summary>{content.summary}</Summary>
                    <ProblemCount problems={content.problems} />
                  </Card>
                </li>
              ))}
            </Cards>
          </Group>
        ) : null;
      })}
    </DocSection>
  );
}
