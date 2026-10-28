import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { mediaUp, spacing } from '@/tokens';
import { ExplainerCard } from '@/ui';

import { AppReadmeMarkdown } from './AppReadmeMarkdown';
import {
  type AppReadmeBlock,
  type AppReadmeListItem,
} from './parse-app-readme';

const CardStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
`;

const CardGrid = styled.div`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));

    &[data-ordered] {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
`;

type ListLayout = 'stack' | 'grid';

const getItemKey = (item: AppReadmeListItem) =>
  `${item.title ?? ''}${item.markdown}`;

const getBlockKey = (block: AppReadmeBlock) =>
  block.kind === 'list'
    ? `list-${block.items.map(getItemKey).join()}`
    : `${block.kind}-${block.markdown}`;

const ListItemBody = ({ item }: { item: AppReadmeListItem }) => {
  if (item.markdown === '') {
    return null;
  }

  return (
    <AppReadmeMarkdown
      markdown={item.markdown}
      tone={isDefined(item.title) ? 'muted' : 'ink'}
    />
  );
};

const ListCards = ({
  block,
  layout,
}: {
  block: Extract<AppReadmeBlock, { kind: 'list' }>;
  layout: ListLayout;
}) => {
  const Container = layout === 'grid' ? CardGrid : CardStack;

  return (
    <Container data-ordered={block.ordered ? '' : undefined}>
      {block.items.map((item, index) => (
        <ExplainerCard
          key={getItemKey(item)}
          step={block.ordered ? index + 1 : undefined}
          title={item.title}
        >
          <ListItemBody item={item} />
        </ExplainerCard>
      ))}
    </Container>
  );
};

type AppReadmeBlocksProps = {
  blocks: AppReadmeBlock[];
  listLayout: ListLayout;
};

export function AppReadmeBlocks({ blocks, listLayout }: AppReadmeBlocksProps) {
  return blocks.map((block) => {
    const key = getBlockKey(block);

    switch (block.kind) {
      case 'list':
        return <ListCards key={key} block={block} layout={listLayout} />;
      case 'note':
        return (
          <AppReadmeMarkdown key={key} markdown={block.markdown} size="xs" />
        );
      case 'text':
        return <AppReadmeMarkdown key={key} markdown={block.markdown} />;
    }
  });
}
