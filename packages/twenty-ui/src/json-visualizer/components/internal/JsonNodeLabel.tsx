import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconComponent } from '@ui/display';

const StyledLabelContainer = styled.span<{ isHighlighted?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-color: ${({ theme }) => theme.border.color.medium};
  color: ${({ theme, isHighlighted }) =>
    isHighlighted ? theme.color.blue : theme.font.color.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-style: solid;
  border-width: 1px;
  height: 24px;
  box-sizing: border-box;
  column-gap: ${({ theme }) => theme.spacing(2)};
  display: flex;
  font-variant-numeric: tabular-nums;
  justify-content: center;
  padding-block: ${({ theme }) => theme.spacing(1)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
  width: fit-content;
`;

export const JsonNodeLabel = ({
  label,
  Icon,
  isHighlighted,
}: {
  label: string;
  Icon: IconComponent;
  isHighlighted?: boolean;
}) => {
  const theme = useTheme();

  return (
    <StyledLabelContainer isHighlighted={isHighlighted}>
      <Icon
        size={theme.icon.size.md}
        color={isHighlighted ? theme.color.blue : theme.font.color.tertiary}
      />

      <span>{label}</span>
    </StyledLabelContainer>
  );
};
