import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  color,
  DURATION,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
} from '@/tokens';

const Card = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(5)} ${spacing(6)};
  transition: box-shadow ${DURATION.xs} ease;

  &[data-layout='marker'] {
    align-items: flex-start;
    column-gap: ${spacing(4)};
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  &[data-layout='step'] > * + * {
    margin-top: ${spacing(2)};
  }

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

const StepNumber = styled.span`
  color: ${color('blue')};
  display: block;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  line-height: ${fontSize(4)};
`;

const Title = styled.h3`
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

type ExplainerCardProps = {
  children?: ReactNode;
  step?: number;
  title?: string;
};

export function ExplainerCard({ children, step, title }: ExplainerCardProps) {
  return (
    <Card data-layout={isDefined(step) ? 'step' : 'marker'}>
      {isDefined(step) ? (
        <StepNumber aria-hidden>{String(step).padStart(2, '0')}</StepNumber>
      ) : (
        <Marker aria-hidden />
      )}
      <div>
        {isDefined(title) && <Title>{title}</Title>}
        {children}
      </div>
    </Card>
  );
}
