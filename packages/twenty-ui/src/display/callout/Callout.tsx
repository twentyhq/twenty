import styled from '@emotion/styled';
import { IconHelp, IconX } from '@ui/display/icon/components/TablerIcons';
import { IconButton, LightButton } from '@ui/input';
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
      ? theme.color.blue1
      : variant === 'warning'
        ? theme.color.yellow1
        : variant === 'success'
          ? theme.color.green1
          : variant === 'error'
            ? theme.color.red1
            : theme.color.gray1};
  border: 1px solid
    ${({ theme, variant }) =>
      variant === 'info'
        ? theme.color.blue6
        : variant === 'warning'
          ? theme.color.yellow6
          : variant === 'success'
            ? theme.color.green6
            : variant === 'error'
              ? theme.color.red6
              : theme.color.gray6};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) =>
    `${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(2)}`};
`;

const StyledHeader = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconContainer = styled.div<{ variant: CalloutVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme, variant }) =>
    variant === 'info'
      ? theme.color.blue9
      : variant === 'warning'
        ? theme.color.orange9
        : variant === 'success'
          ? theme.color.green9
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
`;

const StyledDescriptionWrapper = styled.div`
  display: flex;
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  align-self: stretch;
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
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
};

export const Callout = ({
  variant,
  title,
  description,
  action,
  onClose,
}: CalloutProps) => {
  return (
    <StyledCalloutContainer variant={variant}>
      <StyledHeader>
        <StyledIconContainer variant={variant}>
          <IconHelp size={16} />
        </StyledIconContainer>
        <StyledTitle>{title}</StyledTitle>
        <IconButton
          Icon={IconX}
          size="small"
          variant="tertiary"
          ariaLabel="Close"
          onClick={onClose}
        />
      </StyledHeader>
      <StyledDescriptionWrapper>
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
