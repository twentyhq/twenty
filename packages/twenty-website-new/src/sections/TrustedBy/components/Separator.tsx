import { TrustedBySeparatorType } from '@/sections/TrustedBy/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledSeparatorRow = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
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
      <SeparatorText>{separator.text}</SeparatorText>
    </StyledSeparatorRow>
  );
}
