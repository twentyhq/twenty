import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAlertTriangle,
  IconInfoCircle,
} from '../../icon/components/TablerIcons';
import { AppTooltip } from '../../tooltip/AppTooltip';

const StyledBanner = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.accent.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.color.blue};
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const StyledMessage = styled.p`
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
  const tooltipId = 'side-panel-information-banner-tooltip';

  return (
    <StyledBanner
      className={className}
      data-tooltip-id={tooltipMessage ? tooltipId : undefined}
    >
      <StyledIconContainer>
        {variant === 'default' ? (
          <IconInfoCircle size={16} />
        ) : (
          <IconAlertTriangle size={16} />
        )}
      </StyledIconContainer>
      <StyledMessage>{message}</StyledMessage>
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
