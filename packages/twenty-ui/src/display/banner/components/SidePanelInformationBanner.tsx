import { useContext } from 'react';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, type ThemeType } from '@ui/theme';
import {
  IconAlertTriangle,
  IconInfoCircle,
} from '../../icon/components/TablerIcons';
import { AppTooltip } from '../../tooltip/AppTooltip';

const StyledBanner = styled.div<{ theme: ThemeType }>`
  align-items: center;
  background-color: ${({ theme }) => theme.accent.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledIconContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  color: ${({ theme }) => theme.color.blue};
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const StyledMessage = styled.p<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.color.blue};
  flex-grow: 1;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 1.4;
  margin: 0;
  min-width: 0;
`;

export type SidePanelInformationBannerProps = {
  message: string;
  className?: string;
  variant?: 'default' | 'warning';
  tooltipMessage?: string;
};

export const SidePanelInformationBanner = ({
  message,
  className,
  variant = 'default',
  tooltipMessage,
}: SidePanelInformationBannerProps) => {
  const { theme } = useContext(ThemeContext);
  const tooltipId = 'side-panel-information-banner-tooltip';

  return (
    <StyledBanner
      theme={theme}
      className={className}
      data-tooltip-id={tooltipMessage ? tooltipId : undefined}
    >
      <StyledIconContainer theme={theme}>
        {variant === 'default' ? (
          <IconInfoCircle size={16} />
        ) : (
          <IconAlertTriangle size={16} />
        )}
      </StyledIconContainer>
      <StyledMessage theme={theme}>{message}</StyledMessage>
      {isDefined(tooltipMessage) && (
        <AppTooltip
          anchorSelect={`[data-tooltip-id='${tooltipId}']`}
          content={tooltipMessage}
          place="bottom"
        />
      )}
    </StyledBanner>
  );
};
