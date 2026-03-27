import { PlusIcon } from '@/icons';
import { TrustedBySeparatorType } from '@/sections/TrustedBy/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledSeparatorRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: ${theme.spacing(1.5)};
`;

const SeparatorIcon = styled.span`
  display: flex;
  align-items: center;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
`;

const SeparatorLine = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 0;
  height: 1px;
  background-color: ${theme.colors.primary.border[10]};
`;

const SeparatorText = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(3)};
  font-family: ${theme.font.family.mono};
  font-weight: ${theme.font.weight.medium};
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0;
  line-height: ${theme.font.size(4)};
`;

type SeparatorProps = { separator: TrustedBySeparatorType };

export function Separator({ separator }: SeparatorProps) {
  return (
    <StyledSeparatorRow>
      <SeparatorIcon aria-hidden>
        <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
      </SeparatorIcon>
      <SeparatorLine aria-hidden />
      <SeparatorText>{separator.text}</SeparatorText>
      <SeparatorLine aria-hidden />
      <SeparatorIcon aria-hidden>
        <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
      </SeparatorIcon>
    </StyledSeparatorRow>
  );
}
