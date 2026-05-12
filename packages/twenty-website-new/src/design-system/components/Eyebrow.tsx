import { Heading } from '@/design-system/components/Heading';
import { RectangleFillIcon } from '@/icons';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const EyebrowRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(2)};
  text-align: start;
`;

const IconWrapper = styled.div`
  align-items: center;
  display: flex;
  height: ${theme.lineHeight(6)};
  justify-content: center;
  width: ${theme.lineHeight(6)};
  flex-shrink: 0;
`;

const eyebrowColorPrimary = css`
  color: ${theme.colors.primary.text[60]};
`;

const eyebrowColorSecondary = css`
  color: ${theme.colors.secondary.text[60]};
`;

const eyebrowLabelClassName = css`
  &&[data-size='xs'] {
    font-size: ${theme.font.size(4.5)};
    line-height: ${theme.lineHeight(6)};
  }
`;

export type EyebrowProps = {
  children: ReactNode;
  colorScheme?: 'primary' | 'secondary';
  markerHeight?: number;
  markerWidth?: number;
};

export function Eyebrow({
  children,
  colorScheme = 'primary',
  markerHeight,
  markerWidth,
}: EyebrowProps) {
  const colorClassName =
    colorScheme === 'primary' ? eyebrowColorPrimary : eyebrowColorSecondary;
  const headingClassName = [eyebrowLabelClassName, colorClassName].join(' ');

  return (
    <EyebrowRow>
      <IconWrapper>
        <RectangleFillIcon
          fillColor={theme.colors.highlight[100]}
          height={markerHeight}
          size={14}
          width={markerWidth}
        />
      </IconWrapper>
      <Heading as="h3" className={headingClassName} size="xs" weight="medium">
        {children}
      </Heading>
    </EyebrowRow>
  );
}
