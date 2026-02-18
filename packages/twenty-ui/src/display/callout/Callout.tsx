import styled from '@emotion/styled';
import { IconHelp, IconX } from '@ui/display/icon/components/TablerIcons';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { LightButton, LightIconButton } from '@ui/input';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type CalloutVariant =
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'success';

const StyledCalloutContainer = styled.div<{ variant: CalloutVariant }>`
  align-items: flex-start;
  background-color: ${({ theme, variant }) =>
    variant === 'info'
      ? theme.accent.accent1
      : variant === 'warning'
        ? theme.color.orange1
        : variant === 'success'
          ? theme.color.turquoise1
          : variant === 'error'
            ? theme.color.red1
            : theme.color.gray1};
  border: 1px solid
    ${({ theme, variant }) =>
      variant === 'info'
        ? theme.accent.accent6
        : variant === 'warning'
          ? theme.color.orange6
          : variant === 'success'
            ? theme.color.turquoise6
            : variant === 'error'
              ? theme.color.red6
              : theme.color.gray6};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 512px;
  overflow: hidden;
  padding: ${({ theme }) =>
    `${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(2)}`};
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: ${({ theme }) => theme.spacing(6)};
`;

const StyledIconContainer = styled.div<{ variant: CalloutVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme, variant }) =>
    variant === 'info'
      ? theme.accent.accent9
      : variant === 'warning'
        ? theme.color.orange9
        : variant === 'success'
          ? theme.color.turquoise9
          : variant === 'error'
            ? theme.color.red9
            : theme.color.gray9};
`;

const StyledTitle = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDescriptionWrapper = styled.div<{ hasAction: boolean }>`
  align-items: center;
  display: flex;
  align-self: stretch;
  padding-bottom: ${({ hasAction, theme }) =>
    hasAction ? 0 : theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(6)};
`;

const StyledDescription = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
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
