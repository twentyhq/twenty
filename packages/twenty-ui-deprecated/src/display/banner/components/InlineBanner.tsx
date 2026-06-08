import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from '@ui/theme-constants';
import { Button } from '@ui/input/button/components/Button/Button';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { IconInfoCircle } from '@ui/display/icon/components/TablerIcons';
import { Banner, type BannerColor } from './Banner';

const StyledBanner = styled(Banner)`
  border-radius: ${themeCssVariables.border.radius.md};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledBannerContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledBannerText = styled.span`
  flex: 1;
`;

type InlineBannerProps = {
  color?: BannerColor;
  message: string;
  button?: {
    title?: string;
    onClick?: () => void;
    hidden?: boolean;
  };
  LeftIcon?: IconComponent;
} & React.HTMLAttributes<HTMLDivElement>;

export const InlineBanner = ({
  color,
  message,
  button,
  LeftIcon = IconInfoCircle,
}: InlineBannerProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledBanner color={color} variant={'secondary'}>
      <StyledBannerContent>
        <LeftIcon size={theme.icon.size.md} />
        <StyledBannerText>{message}</StyledBannerText>
      </StyledBannerContent>
      {button && !button.hidden && (
        <Button
          size="small"
          variant="secondary"
          accent={color}
          title={button?.title}
          onClick={button?.onClick}
        />
      )}
    </StyledBanner>
  );
};
