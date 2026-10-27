import { styled } from '@linaria/react';

import {
  color,
  DURATION,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
} from '@/tokens';
import { CornerMarkers } from '@/ui';

import { AppReadmeMarkdown } from './AppReadmeMarkdown';
import {
  type AppReadmeBlock,
  type AppReadmeListItem,
} from './parse-app-readme';

const Note = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(5)} ${spacing(6)};
  position: relative;
`;

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

const Card = styled.div`
  align-items: flex-start;
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  column-gap: ${spacing(4)};
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  padding: ${spacing(5)} ${spacing(6)};
  transition: box-shadow ${DURATION.xs} ease;

  &:hover {
    box-shadow: ${SHADOW.card};
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const Marker = styled.span`
  background-color: ${color('blue')};
  border-radius: 1px;
  height: 7px;
  margin-top: ${spacing(2)};
  width: 14px;
`;

const StepCard = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(5)} ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const StepNumber = styled.span`
  color: ${color('blue')};
  display: block;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  line-height: ${fontSize(4)};
`;

const CardTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.01em;
  line-height: 1.3;

  & + * {
    margin-top: ${spacing(1)};
  }
`;

const getItemKey = (item: AppReadmeListItem) =>
  `${item.title ?? ''}${item.markdown}`;

const getBlockKey = (block: AppReadmeBlock) =>
  block.kind === 'list'
    ? `list-${block.items.map(getItemKey).join()}`
    : `${block.kind}-${block.markdown}`;

const CardBody = ({ item }: { item: AppReadmeListItem }) => (
  <div>
    {item.title !== undefined && <CardTitle>{item.title}</CardTitle>}
    {item.markdown !== '' && (
      <AppReadmeMarkdown
        markdown={item.markdown}
        tone={item.title === undefined ? 'ink' : 'muted'}
      />
    )}
  </div>
);

const ListCards = ({
  block,
  layout,
}: {
  block: Extract<AppReadmeBlock, { kind: 'list' }>;
  layout: 'stack' | 'grid';
}) => {
  const Container = layout === 'grid' ? CardGrid : CardStack;

  return (
    <Container data-ordered={block.ordered ? '' : undefined}>
      {block.items.map((item, index) =>
        block.ordered ? (
          <StepCard key={getItemKey(item)}>
            <StepNumber aria-hidden>
              {String(index + 1).padStart(2, '0')}
            </StepNumber>
            <CardBody item={item} />
          </StepCard>
        ) : (
          <Card key={getItemKey(item)}>
            <Marker aria-hidden />
            <CardBody item={item} />
          </Card>
        ),
      )}
    </Container>
  );
};

type AppReadmeBlocksProps = {
  blocks: AppReadmeBlock[];
  listLayout: 'stack' | 'grid';
};

export function AppReadmeBlocks({ blocks, listLayout }: AppReadmeBlocksProps) {
  return blocks.map((block) => {
    const key = getBlockKey(block);

    switch (block.kind) {
      case 'list':
        return <ListCards key={key} block={block} layout={listLayout} />;
      case 'note':
        return (
          <Note key={key}>
            <CornerMarkers />
            <AppReadmeMarkdown markdown={block.markdown} tone="ink" />
          </Note>
        );
      case 'text':
        return <AppReadmeMarkdown key={key} markdown={block.markdown} />;
    }
  });
}
