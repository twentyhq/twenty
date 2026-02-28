import { styled } from '@linaria/react';
import { theme } from '@ui/theme';

const StyledBanner = styled.div<{ variant?: BannerVariant }>`
  align-items: center;
  backdrop-filter: blur(5px);
  background: ${({ variant }) =>
    variant === 'danger' ? theme.color.red : theme.color.blue};
  display: flex;
  gap: ${theme.spacing[3]};
  height: 40px;
  justify-content: center;
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  width: 100%;
  color: ${theme.font.color.inverted};
  font-family: Inter;
  font-size: ${theme.font.size.md};
  font-style: normal;
  font-weight: ${theme.font.weight.medium};
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
}: BannerProps) => {
  return (
    <StyledBanner variant={variant} className={className}>
      {children}
    </StyledBanner>
  );
};
