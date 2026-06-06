'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';

export type CategoryOption<TValue extends string> = {
  value: TValue;
  label: string;
  description: string;
  examples: string;
};

const CardGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
`;

const Card = styled.button`
  align-items: flex-start;
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  cursor: pointer;
  display: flex;
  gap: ${theme.spacing(2)};
  padding: ${theme.spacing(2.5)} ${theme.spacing(3)};
  text-align: left;
  width: 100%;

  &[data-selected='true'] {
    background: rgba(74, 56, 245, 0.1);
    border-color: ${theme.colors.highlight[100]};
  }

  &[data-invalid='true'] {
    border-color: #ff9a9a;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.highlight[100]};
    outline-offset: 2px;
  }
`;

const Square = styled.span`
  align-items: center;
  border: 1.5px solid ${theme.colors.secondary.border[40]};
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.primary.text[100]};
  display: flex;
  flex: none;
  font-size: ${theme.font.size(3)};
  height: 18px;
  justify-content: center;
  margin-top: 2px;
  width: 18px;

  [data-selected='true'] & {
    background: ${theme.colors.highlight[100]};
    border-color: ${theme.colors.highlight[100]};
  }
`;

const Texts = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(0.5)};
`;

const Title = styled.span`
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.75)};
  font-weight: ${theme.font.weight.medium};
`;

const Description = styled.span`
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.25)};
`;

const Examples = styled.span`
  color: ${theme.colors.secondary.text[40]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
`;

type CategoryCardSelectProps<TValue extends string> = {
  options: ReadonlyArray<CategoryOption<TValue>>;
  values: ReadonlyArray<TValue>;
  onToggle: (value: TValue) => void;
  invalid?: boolean;
  ariaLabel?: string;
};

export function CategoryCardSelect<TValue extends string>({
  options,
  values,
  onToggle,
  invalid,
  ariaLabel,
}: CategoryCardSelectProps<TValue>) {
  return (
    <CardGroup role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = values.includes(option.value);
        return (
          <Card
            key={option.value}
            type="button"
            aria-pressed={selected}
            data-selected={selected ? 'true' : undefined}
            data-invalid={invalid && !selected ? 'true' : undefined}
            onClick={() => onToggle(option.value)}
          >
            <Square>{selected ? '✓' : ''}</Square>
            <Texts>
              <Title>{option.label}</Title>
              <Description>{option.description}</Description>
              <Examples>ex. {option.examples}</Examples>
            </Texts>
          </Card>
        );
      })}
    </CardGroup>
  );
}
