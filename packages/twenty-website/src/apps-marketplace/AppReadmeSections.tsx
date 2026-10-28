import { styled } from '@linaria/react';

import { mediaUp, spacing } from '@/tokens';
import { Heading, SectionShell } from '@/ui';

import { AppReadmeBlocks } from './AppReadmeBlocks';
import { type AppReadmeSection } from './parse-app-readme';

const ExplainerGrid = styled.div`
  display: grid;
  gap: ${spacing(8)} ${spacing(10)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Stack = styled.div`
  & > * + * {
    margin-top: ${spacing(8)};
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
      <Stack>
        <Heading as="h2" size="md" weight="light">
          {section.title}
        </Heading>
        <Column>
          <AppReadmeBlocks blocks={section.blocks} listLayout="grid" />
        </Column>
      </Stack>
    );
  }

  const mainBlocksStart = section.hasSubheadings
    ? 0
    : Math.max(firstListIndex, 0);

  return (
    <ExplainerGrid>
      <Column>
        <Heading as="h2" size="md" weight="light">
          {section.title}
        </Heading>
        <AppReadmeBlocks
          blocks={section.blocks.slice(0, mainBlocksStart)}
          listLayout="stack"
        />
      </Column>
      <Column>
        <AppReadmeBlocks
          blocks={section.blocks.slice(mainBlocksStart)}
          listLayout="stack"
        />
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
