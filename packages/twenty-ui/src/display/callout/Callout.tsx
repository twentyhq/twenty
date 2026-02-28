import { styled } from '@linaria/react';
import { IconHelp, IconX } from '@ui/display/icon/components/TablerIcons';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { LightButton, LightIconButton } from '@ui/input';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeVar } from '@ui/theme';

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
      ? themeVar.accent.accent1
      : variant === 'warning'
        ? themeVar.color.orange1
        : variant === 'success'
          ? themeVar.color.turquoise1
          : variant === 'error'
            ? themeVar.color.red1
            : themeVar.color.gray1};
  border: 1px solid
    ${({ variant }) =>
      variant === 'info'
        ? themeVar.accent.accent6
        : variant === 'warning'
          ? themeVar.color.orange6
          : variant === 'success'
            ? themeVar.color.turquoise6
            : variant === 'error'
              ? themeVar.color.red6
              : themeVar.color.gray6};
  border-radius: ${themeVar.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeVar.spacing[2]};
  max-width: 512px;
  overflow: hidden;
  padding: ${themeVar.spacing[3]} ${themeVar.spacing[3]} ${themeVar.spacing[2]};
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-direction: row;
  gap: ${themeVar.spacing[2]};
  min-height: ${themeVar.spacing[6]};
`;

const StyledIconContainer = styled.div<{
  variant: CalloutVariant;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: ${themeVar.spacing[4]};
  width: ${themeVar.spacing[4]};
  color: ${({ variant }) =>
    variant === 'info'
      ? themeVar.accent.accent9
      : variant === 'warning'
        ? themeVar.color.orange9
        : variant === 'success'
          ? themeVar.color.turquoise9
          : variant === 'error'
            ? themeVar.color.red9
            : themeVar.color.gray9};
`;

const StyledTitle = styled.div`
  flex: 1;
  color: ${themeVar.font.color.primary};
  font-family: ${themeVar.font.family};
  font-size: ${themeVar.font.size.md};
  font-weight: ${themeVar.font.weight.medium};
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
  padding-bottom: ${({ hasAction }) => (hasAction ? 0 : themeVar.spacing[2])};
  padding-left: ${themeVar.spacing[6]};
`;

const StyledDescription = styled.div`
  flex: 1;
  color: ${themeVar.font.color.tertiary};
  font-family: ${themeVar.font.family};
  font-size: ${themeVar.font.size.sm};
  font-weight: ${themeVar.font.weight.regular};
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
