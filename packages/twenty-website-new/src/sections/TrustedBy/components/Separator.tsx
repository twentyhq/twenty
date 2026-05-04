import type { TrustedBySeparatorType } from '@/sections/TrustedBy/types';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
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

type SeparatorProps = {
  renderText: (descriptor: MessageDescriptor) => string;
  separator: TrustedBySeparatorType;
};

export function Separator({ renderText, separator }: SeparatorProps) {
  return (
    <StyledSeparatorRow>
      <SeparatorText>{renderText(separator.text)}</SeparatorText>
    </StyledSeparatorRow>
  );
}

Separator.displayName = 'TrustedBy.Separator';
