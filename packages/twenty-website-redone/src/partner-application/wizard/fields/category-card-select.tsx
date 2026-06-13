'use client';

import { styled } from '@linaria/react';

import { CheckMark } from '@/icons';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

export type CategoryOption<TValue extends string> = {
  description: string;
  examples: string;
  label: string;
  value: TValue;
};

const CardGroup = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Card = styled.button`
  align-items: flex-start;
  background: none;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  column-gap: ${spacing(2)};
  cursor: pointer;
  display: flex;
  padding: ${spacing(2.5)} ${spacing(3)};
  text-align: left;
  width: 100%;

  &[data-selected] {
    border-color: ${color('blue')};
  }

  &[data-invalid] {
    border-color: ${color('error')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const Indicator = styled.span`
  align-items: center;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(1)};
  color: ${color('white')};
  display: flex;
  flex: none;
  height: 18px;
  justify-content: center;
  margin-top: 2px;
  width: 18px;

  [data-selected] & {
    background: ${color('blue')};
    border-color: ${color('blue')};
  }
`;

const Texts = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(0.5)};
  }
`;

const Title = styled.span`
  ${typeRampDeclarations('bodySm')}
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
`;

const Description = styled.span`
  ${typeRampDeclarations('bodySm')}
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
`;

const Examples = styled.span`
  ${typeRampDeclarations('bodyXs')}
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  opacity: 0.7;
`;

export function CategoryCardSelect<TValue extends string>({
  ariaLabel,
  invalid = false,
  onToggle,
  options,
  values,
}: {
  ariaLabel: string;
  invalid?: boolean;
  onToggle: (value: TValue) => void;
  options: readonly CategoryOption<TValue>[];
  values: readonly TValue[];
}) {
  return (
    <CardGroup aria-label={ariaLabel} role="group">
      {options.map((option) => {
        const selected = values.includes(option.value);
        return (
          <Card
            aria-pressed={selected}
            data-invalid={invalid && !selected ? '' : undefined}
            data-selected={selected ? '' : undefined}
            key={option.value}
            onClick={() => onToggle(option.value)}
            type="button"
          >
            <Indicator aria-hidden>
              {selected ? <CheckMark sizePx={12} /> : null}
            </Indicator>
            <Texts>
              <Title>{option.label}</Title>
              <Description>{option.description}</Description>
              <Examples>{option.examples}</Examples>
            </Texts>
          </Card>
        );
      })}
    </CardGroup>
  );
}
