import type { MessageDescriptor } from '@lingui/core';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

const StyledChip = styled.div`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  gap: ${theme.spacing(2)};

  img {
    filter: grayscale(1);
    opacity: 0.72;
  }
`;

const StyledText = styled.span`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.02em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
`;

type ClientCountProps = {
  label: MessageDescriptor;
  renderText: (descriptor: MessageDescriptor) => string;
};

export function ClientCount({ label, renderText }: ClientCountProps) {
  return (
    <StyledChip>
      <NextImage
        alt=""
        height={14}
        src="/images/home/logo-bar/others-icon.svg"
        unoptimized
        width={14}
      />
      <StyledText>{renderText(label)}</StyledText>
    </StyledChip>
  );
}

ClientCount.displayName = 'TrustedBy.ClientCount';
