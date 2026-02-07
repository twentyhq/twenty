import styled from '@emotion/styled';
import { IconInfoCircle, IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

type CalloutVariant = 'info' | 'warning' | 'error' | 'neutral' | 'success';

const variantConfig = {
  info: {
    iconColor: '#3498db',
    borderColor: '#3498db',
    backgroundColor: '#f0f8ff',
  },
  warning: {
    iconColor: '#ff9500',
    borderColor: '#ff9500',
    backgroundColor: '#fff8f0',
  },
  error: {
    iconColor: '#ef4444',
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  neutral: {
    iconColor: '#9ca3af',
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  success: {
    iconColor: '#ffc107',
    borderColor: '#ffc107',
    backgroundColor: '#ffc107',
  }
};

const StyledCalloutContainer = styled.div<{ variant: CalloutVariant }>`
    background-color: ${({ variant }) => variantConfig[variant].backgroundColor};
    border: 1px solid ${({ variant }) => variantConfig[variant].borderColor};
    border-radius: 1px;
    box-sizing: border-box;
    display: flex;
    gap: ${({ theme }) => theme.spacing(3)};
    padding: ${({ theme }) => theme.spacing(4)};
    position: relative;
    width: 100%;
`;

const StyledIconContainer = styled.div<{ variant: CalloutVariant }>`
  align-items: flex-start;
  color: ${({ variant }) => variantConfig[variant].iconColor};
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
  color: ${({ theme }) => theme.font.color.secondary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: 1.6;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledLearnMoreLink = styled.a`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  text-decoration: none;
  transition: color ${({ theme }) => theme.animation.duration.instant}s ease;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
    text-decoration: underline;
  }
`;

const StyledCloseButton = styled(IconButton)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(3)};
  top: ${({ theme }) => theme.spacing(3)};
`;

export type WorkflowFormCalloutProps = {
  variant: CalloutVariant;
  title: string;
  description: string;
  learnMoreUrl: string;
  onClose: () => void;
  className: string;
};

export const Callout = ({
                                      variant,
                                      title,
                                      description,
                                      learnMoreUrl,
                                      onClose,
                                      className,
                                    }: WorkflowFormCalloutProps) => {

  return (
    <StyledCalloutContainer variant={variant} className={className}>
      <StyledIconContainer variant={variant}>
        <IconInfoCircle size={16} />
      </StyledIconContainer>

      <StyledContent>
        <StyledTitle>{title}</StyledTitle>
        <StyledDescription>{description}</StyledDescription>
          <StyledFooter>
            <StyledLearnMoreLink
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </StyledLearnMoreLink>
          </StyledFooter>
      </StyledContent>

        <StyledCloseButton
          Icon={IconX}
          size="small"
          variant="tertiary"
          onClick={onClose}
          ariaLabel={`Close`}
        />
    </StyledCalloutContainer>
  );
};