import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme-constants';

const StyledBanner = styled.div<{
  bannerColor: BannerColor;
  bannerVariant: BannerVariant;
}>`
  align-items: center;
  backdrop-filter: ${({ bannerVariant }) =>
    bannerVariant === 'primary' ? 'blur(5px)' : 'none'};
  background: ${({ bannerColor, bannerVariant }) => {
    if (bannerVariant === 'secondary') {
      return bannerColor === 'danger'
        ? themeCssVariables.background.transparent.danger
        : themeCssVariables.background.transparent.blue;
    }
    return bannerColor === 'danger'
      ? themeCssVariables.color.red
      : themeCssVariables.color.blue;
  }};
  box-sizing: border-box;
  color: ${({ bannerColor, bannerVariant }) => {
    if (bannerVariant === 'secondary') {
      return bannerColor === 'danger'
        ? themeCssVariables.color.red
        : themeCssVariables.color.blue;
    }
    return themeCssVariables.font.color.inverted;
  }};
  display: flex;
  font-family: Inter;
  font-size: ${themeCssVariables.font.size.md};
  font-style: normal;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
  line-height: 150%;
  min-height: 40px;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export type BannerColor = 'blue' | 'danger';

export type BannerVariant = 'primary' | 'secondary';

type BannerProps = {
  color?: BannerColor;
  variant?: BannerVariant;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Banner = ({
  color = 'blue',
  variant = 'primary',
  className,
  children,
}: BannerProps) => {
  return (
    <StyledBanner
      bannerColor={color}
      bannerVariant={variant}
      className={className}
    >
      {children}
    </StyledBanner>
  );
};
