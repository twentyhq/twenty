import { styled } from '@linaria/react';

import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import {
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { cssVariableStyle } from '@/ui/css-variable-style';

import { Body } from './Body';
import { MODEL_CARD_SETTINGS } from './model-card-settings';
import { Reveal } from './Reveal';

const Cards = styled.ul`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  padding: 0;

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

// The /apps card frame, without its hover fill: these cards are not links.
const Card = styled.li`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  opacity: 0;
  overflow: hidden;
  transform: translateY(12px);
  transition:
    opacity ${DURATION.xl} ${EASING.standard},
    transform ${DURATION.xl} ${EASING.standard};
  transition-delay: calc(var(--model-card-index) * 80ms);

  [data-revealed] & {
    opacity: 1;
    transform: none;
  }

  ${REDUCED_MOTION} {
    opacity: 1;
    transform: none;
    transition: none;
  }
`;

const Visual = styled.div`
  align-items: center;
  border-bottom: 1px solid ${semanticColor.line};
  display: flex;
  height: 160px;
  justify-content: center;

  ${mediaUp('md')} {
    height: 180px;
  }
`;

const ModelBox = styled.div`
  aspect-ratio: 1 / 1;
  height: 82%;
`;

const Content = styled.div`
  padding: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Title = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 24px;
`;

export type ModelCard = {
  body: string;
  // File name under /models, without the extension.
  model: string;
  title: string;
};

type ModelCardGridProps = {
  cards: readonly ModelCard[];
};

export function ModelCardGrid({ cards }: ModelCardGridProps) {
  return (
    <Reveal>
      <Cards>
        {cards.map((card, index) => (
          <Card
            key={card.model}
            style={cssVariableStyle({ '--model-card-index': index })}
          >
            <Visual aria-hidden data-illustration={card.model}>
              <ModelBox>
                <HalftoneModel
                  modelUrl={`/models/${card.model}.glb`}
                  settings={MODEL_CARD_SETTINGS}
                />
              </ModelBox>
            </Visual>
            <Content>
              <Title>{card.title}</Title>
              <Body muted size="sm">
                {card.body}
              </Body>
            </Content>
          </Card>
        ))}
      </Cards>
    </Reveal>
  );
}
