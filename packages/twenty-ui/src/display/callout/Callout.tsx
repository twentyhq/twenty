import styled from '@emotion/styled';
import { IconHelp, IconX } from '@ui/display/icon/components/TablerIcons';
import { IconButton, LightButton } from '@ui/input';

export type CalloutVariant =
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'success';

const StyledCalloutContainer = styled.div<{ variant: CalloutVariant }>`
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
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  margin-left: ${({ theme }) => theme.spacing(7)};
`;

const StyledIconContainer = styled.div<{ variant: CalloutVariant }>`
  align-items: flex-start;
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
  display: flex;
  flex-shrink: 0;
  padding-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 1.5;
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: 15px;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledCloseButton = styled(IconButton)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(3)};
  top: ${({ theme }) => theme.spacing(3)};
`;

export type CalloutProps = {
  variant: CalloutVariant;
  title: string;
  description: string;
  learnMoreText: string;
  learnMoreUrl: string;
  onClose: () => void;
};

export const Callout = ({
  variant,
  title,
  description,
  learnMoreText,
  learnMoreUrl,
  onClose,
}: CalloutProps) => {
  return (
    <StyledCalloutContainer variant={variant}>
      <StyledIconContainer variant={variant}>
        <IconHelp size={16} />
      </StyledIconContainer>

      <StyledContent>
        <StyledTitle>{title}</StyledTitle>
        <StyledDescription>{description}</StyledDescription>
        <StyledFooter>
          <LightButton
            type={'button'}
            title={learnMoreText}
            onClick={() => {
              window.open(learnMoreUrl, '_blank', 'noopener noreferrer');
            }}
          />
        </StyledFooter>
      </StyledContent>
      <StyledCloseButton
        Icon={IconX}
        size="small"
        variant="tertiary"
        ariaLabel={`Close`}
        onClick={onClose}
      />
    </StyledCalloutContainer>
  );
};
