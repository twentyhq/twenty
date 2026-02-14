import styled from '@emotion/styled';
import { type JSX } from 'react';
import { Label } from '@ui/display';

type HorizontalSeparatorProps = {
  visible?: boolean;
  text?: string;
  noMargin?: boolean;
  color?: string;
};
const StyledSeparator = styled.div<HorizontalSeparatorProps>`
  background-color: ${({ theme, color }) => color ?? theme.border.color.medium};
  height: ${({ visible }) => (visible ? '1px' : 0)};
  flex-shrink: 0;
  margin-bottom: ${({ theme, noMargin }) => (noMargin ? 0 : theme.spacing(3))};
  margin-top: ${({ theme, noMargin }) => (noMargin ? 0 : theme.spacing(3))};
  width: 100%;
`;

const StyledSeparatorContainer = styled.div<{ noMargin: boolean }>`
  align-items: center;
  display: flex;
  margin-bottom: ${({ theme, noMargin }) => (noMargin ? 0 : theme.spacing(3))};
  margin-top: ${({ theme, noMargin }) => (noMargin ? 0 : theme.spacing(3))};
  width: 100%;
`;

const StyledLine = styled.div<HorizontalSeparatorProps>`
  background-color: ${({ theme }) => theme.border.color.medium};
  height: ${({ visible }) => (visible ? '1px' : 0)};
  flex-grow: 1;
`;

const StyledText = styled.span`
  margin: 0 ${({ theme }) => theme.spacing(2)};
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
