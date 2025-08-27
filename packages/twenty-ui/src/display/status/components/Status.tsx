import { styled } from '@linaria/react';
import { type ThemeColor } from '@ui/theme';
import { themeColorSchema } from '@ui/theme/utils/themeColorSchema';

import { Loader } from '@ui/feedback/loader/components/Loader';

const StyledStatus = styled.h3<{
  color: ThemeColor;
  weight: 'regular' | 'medium';
  isLoaderVisible: boolean;
}>`
  align-items: center;
  background: ${({ color }) => `var(--tag-background-${color})`};
  border-radius: var(--border-radius-pill);
  color: ${({ color }) => `var(--tag-text-${color})`};
  display: inline-flex;
  font-size: var(--font-size-md);
  font-style: normal;
  font-weight: ${({ weight }) =>
    weight === 'regular'
      ? 'var(--font-weight-regular)'
      : 'var(--font-weight-medium)'};
  gap: var(--spacing-1);
  height: var(--spacing-5);
  margin: 0;
  overflow: hidden;
  padding: 0
    ${({ isLoaderVisible }) =>
      isLoaderVisible ? 'var(--spacing-1)' : 'var(--spacing-2)'}
    0 var(--spacing-2);

  &:before {
    background-color: ${({ color }) => `var(--tag-text-${color})`};
    border-radius: var(--border-radius-rounded);
    content: '';
    display: block;
    flex-shrink: 0;
    height: var(--spacing-1);
    width: var(--spacing-1);
  }
`;

const StyledContent = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type StatusProps = {
  className?: string;
  color: ThemeColor;
  isLoaderVisible?: boolean;
  text: string;
  onClick?: () => void;
  weight?: 'regular' | 'medium';
};

export const Status = ({
  className,
  color,
  isLoaderVisible = false,
  text,
  onClick,
  weight = 'regular',
}: StatusProps) => (
  <StyledStatus
    className={className}
    color={themeColorSchema.catch('gray').parse(color)}
    onClick={onClick}
    weight={weight}
    isLoaderVisible={isLoaderVisible}
  >
    <StyledContent>{text}</StyledContent>
    {isLoaderVisible ? <Loader color={color} /> : null}
  </StyledStatus>
);
