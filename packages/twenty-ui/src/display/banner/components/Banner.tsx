import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';

const StyledBanner = styled.div<{ variant?: BannerVariant }>`
  align-items: center;
  backdrop-filter: blur(5px);
  background: ${({ variant }) =>
    variant === 'danger'
      ? themeCssVariables.color.red
      : themeCssVariables.color.blue};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  height: 40px;
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  width: 100%;
  color: ${themeCssVariables.font.color.inverted};
  font-family: Inter;
  font-size: ${themeCssVariables.font.size.md};
  font-style: normal;
  font-weight: ${themeCssVariables.font.weight.medium};
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
