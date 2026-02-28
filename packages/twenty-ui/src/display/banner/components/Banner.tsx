import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';

const StyledBanner = styled.div<{ variant?: BannerVariant }>`
  align-items: center;
  backdrop-filter: blur(5px);
  background: ${({ variant }) =>
    variant === 'danger' ? themeVar.color.red : themeVar.color.blue};
  display: flex;
  gap: ${themeVar.spacing[3]};
  height: 40px;
  justify-content: center;
  padding: ${themeVar.spacing[2]} ${themeVar.spacing[3]};
  width: 100%;
  color: ${themeVar.font.color.inverted};
  font-family: Inter;
  font-size: ${themeVar.font.size.md};
  font-style: normal;
  font-weight: ${themeVar.font.weight.medium};
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
