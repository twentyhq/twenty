import { styled } from '@linaria/react';

const StyledBanner = styled.div<{ variant?: BannerVariant }>`
  align-items: center;
  backdrop-filter: blur(5px);
  background: ${({ variant }) =>
    variant === 'danger' ? 'var(--color-red)' : 'var(--color-blue)'};
  display: flex;
  gap: var(--spacing-3);
  height: 40px;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-3);
  width: 100%;
  color: var(--font-color-inverted);
  font-family: Inter;
  font-size: var(--font-size-md);
  font-style: normal;
  font-weight: var(--font-weight-medium);
  line-height: 150%;
  box-sizing: border-box;
`;

export type BannerVariant = 'danger' | 'default';

type BannerProps = {
  variant?: BannerVariant;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Banner = ({
  variant = 'default',
  className,
  children,
}: BannerProps) => (
  <StyledBanner variant={variant} className={className}>
    {children}
  </StyledBanner>
);
