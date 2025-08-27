import { styled } from '@linaria/react';
import { Label } from '@ui/display';
import { type JSX } from 'react';

type HorizontalSeparatorProps = {
  visible?: boolean;
  text?: string;
  noMargin?: boolean;
  color?: string;
};
const StyledSeparator = styled.div<HorizontalSeparatorProps>`
  background-color: var(--border-color-medium);
  height: ${({ visible }) => (visible ? '1px' : 0)};
  flex-shrink: 0;
  margin-bottom: ${({ noMargin }) => (noMargin ? 0 : 'var(--spacing-3)')};
  margin-top: ${({ noMargin }) => (noMargin ? 0 : 'var(--spacing-3)')};
  width: 100%;
`;

const StyledSeparatorContainer = styled.div<{ noMargin: boolean }>`
  align-items: center;
  display: flex;
  margin-bottom: ${({ noMargin }) => (noMargin ? 0 : 'var(--spacing-3)')};
  margin-top: ${({ noMargin }) => (noMargin ? 0 : 'var(--spacing-3)')};
  width: 100%;
`;

const StyledLine = styled.div<HorizontalSeparatorProps>`
  background-color: var(--border-color-medium);
  height: ${({ visible }) => (visible ? '1px' : 0)};
  flex-grow: 1;
`;

const StyledText = styled.span`
  margin: 0 var(--spacing-2);
`;

export const HorizontalSeparator = ({
  visible = true,
  text = '',
  noMargin = false,
  color,
}: HorizontalSeparatorProps): JSX.Element => (
  <>
    {text ? (
      <StyledSeparatorContainer noMargin={noMargin}>
        <StyledLine visible={visible} />
        <Label>
          <StyledText>{text}</StyledText>
        </Label>
        <StyledLine visible={visible} />
      </StyledSeparatorContainer>
    ) : (
      <StyledSeparator visible={visible} noMargin={noMargin} color={color} />
    )}
  </>
);
