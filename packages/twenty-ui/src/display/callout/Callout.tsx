import { styled } from '@linaria/react';
import { IconHelp, IconX } from '@ui/display/icon/components/TablerIcons';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { LightButton, LightIconButton } from '@ui/input';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from '@ui/theme';

export type CalloutVariant =
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'success';

const StyledCalloutContainer = styled.div<{
  variant: CalloutVariant;
}>`
  align-items: flex-start;
  background-color: ${({ variant }) =>
    variant === 'info'
      ? themeCssVariables.accent.accent1
      : variant === 'warning'
        ? themeCssVariables.color.orange1
        : variant === 'success'
          ? themeCssVariables.color.turquoise1
          : variant === 'error'
            ? themeCssVariables.color.red1
            : themeCssVariables.color.gray1};
  border: 1px solid
    ${({ variant }) =>
      variant === 'info'
        ? themeCssVariables.accent.accent6
        : variant === 'warning'
          ? themeCssVariables.color.orange6
          : variant === 'success'
            ? themeCssVariables.color.turquoise6
            : variant === 'error'
              ? themeCssVariables.color.red6
              : themeCssVariables.color.gray6};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-width: 512px;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
`;

const StyledIconContainer = styled.div<{
  variant: CalloutVariant;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  width: ${themeCssVariables.spacing[4]};
  color: ${({ variant }) =>
    variant === 'info'
      ? themeCssVariables.accent.accent9
      : variant === 'warning'
        ? themeCssVariables.color.orange9
        : variant === 'success'
          ? themeCssVariables.color.turquoise9
          : variant === 'error'
            ? themeCssVariables.color.red9
            : themeCssVariables.color.gray9};
`;

const StyledTitle = styled.div`
  flex: 1;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDescriptionWrapper = styled.div<{
  hasAction: boolean;
}>`
  align-items: center;
  display: flex;
  align-self: stretch;
  padding-bottom: ${({ hasAction }) =>
    hasAction ? 0 : themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[6]};
`;

const StyledDescription = styled.div`
  flex: 1;
  color: ${themeCssVariables.font.color.tertiary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4;
`;

const StyledFooter = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  justify-content: flex-end;
`;

export type CalloutProps = {
  variant: CalloutVariant;
  title: string;
  description: string;
  Icon?: IconComponent;
  action?: {
    label: string;
    onClick: () => void;
  };
  isClosable?: boolean;
  onClose?: () => void;
};

export const Callout = ({
  variant,
  title,
  description,
  Icon = IconHelp,
  action,
  isClosable = false,
  onClose,
}: CalloutProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    if (!isClosable) {
      return;
    }

    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <StyledCalloutContainer variant={variant}>
      <StyledHeader>
        <StyledIconContainer variant={variant}>
          <Icon size={16} />
        </StyledIconContainer>
        <StyledTitle>{title}</StyledTitle>
        {isClosable && (
          <LightIconButton
            Icon={IconX}
            size="small"
            aria-label="Close"
            onClick={handleClose}
          />
        )}
      </StyledHeader>
      <StyledDescriptionWrapper hasAction={isDefined(action)}>
        <StyledDescription>{description}</StyledDescription>
      </StyledDescriptionWrapper>
      {isDefined(action) && (
        <StyledFooter>
          <LightButton
            type="button"
            title={action.label}
            onClick={action.onClick}
          />
        </StyledFooter>
      )}
    </StyledCalloutContainer>
  );
};
