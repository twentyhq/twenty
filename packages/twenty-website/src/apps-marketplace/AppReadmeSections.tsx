import { styled } from '@linaria/react';

import { mediaUp, spacing } from '@/tokens';
import { Heading, SectionIntro, SectionShell, SectionStack } from '@/ui';

import { AppReadmeBlocks } from './AppReadmeBlocks';
import { AppReadmeMarkdown } from './AppReadmeMarkdown';
import { type AppReadmeSection } from './parse-app-readme';

const ExplainerGrid = styled.div`
  display: grid;
  gap: ${spacing(8)} ${spacing(10)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Column = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const SectionContent = ({ section }: { section: AppReadmeSection }) => {
  const firstListIndex = section.blocks.findIndex(
    (block) => block.kind === 'list',
  );

  if (firstListIndex === 0 && !section.hasSubheadings) {
    return (
      <SectionStack>
        <SectionIntro>
          <Heading as="h2" size="lg" weight="light">
            {section.title}
          </Heading>
        </SectionIntro>
        <Column>
          <AppReadmeBlocks blocks={section.blocks} listLayout="grid" />
        </Column>
      </SectionStack>
    );
  }

  const asideBlocks =
    firstListIndex > 0 ? section.blocks.slice(0, firstListIndex) : [];
  const mainBlocks =
    firstListIndex > 0 ? section.blocks.slice(firstListIndex) : section.blocks;

  return (
    <ExplainerGrid>
      <Column>
        <Heading as="h2" size="sm" weight="light">
          {section.title}
        </Heading>
        {!section.hasSubheadings && (
          <AppReadmeBlocks blocks={asideBlocks} listLayout="stack" />
        )}
      </Column>
      <Column>
        {section.hasSubheadings ? (
          <AppReadmeMarkdown markdown={section.markdown} />
        ) : (
          <AppReadmeBlocks blocks={mainBlocks} listLayout="stack" />
        )}
      </Column>
    </ExplainerGrid>
  );
};

type AppReadmeSectionsProps = {
  sections: AppReadmeSection[];
};

export function AppReadmeSections({ sections }: AppReadmeSectionsProps) {
  return sections.map((section, index) => (
    <SectionShell
      key={section.title}
      rhythm="section"
      scheme={index % 2 === 0 ? 'muted' : 'light'}
    >
      <SectionContent section={section} />
    </SectionShell>
  ));
}
