import { useTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';

const StyledLabelContainer = styled.span<{
  highlighting?: JsonNodeHighlighting;
}>`
  align-items: center;
  background-color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? 'var(--color-adaptive-blue-1)'
      : highlighting === 'red'
        ? 'var(--color-background-danger)'
        : 'var(--color-background-transparent-lighter)'};
  border-color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? 'var(--color-adaptive-blue-2)'
      : highlighting === 'red'
        ? 'var(--color-border-danger)'
        : 'var(--color-border-medium)'};
  color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? 'var(--color-blue)'
      : highlighting === 'red'
        ? 'var(--color-font-danger)'
        : 'var(--color-font-primary)'};
  border-radius: var(--border-radius-sm);
  border-style: solid;
  border-width: 1px;
  height: 24px;
  box-sizing: border-box;
  column-gap: var(--spacing-2);
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  white-space: nowrap;
  padding-block: var(--spacing-1);
  padding-inline: var(--spacing-2);
`;

export const JsonNodeLabel = ({
  label,
  Icon,
  highlighting,
}: {
  label: string;
  Icon: IconComponent;
  highlighting?: JsonNodeHighlighting | undefined;
}) => {
  const theme = useTheme();

  return (
    <StyledLabelContainer highlighting={highlighting}>
      <Icon
        size={theme.icon.size.md}
        color={
          highlighting === 'blue'
            ? theme.color.blue
            : highlighting === 'red'
              ? theme.font.color.danger
              : theme.font.color.tertiary
        }
      />

      <span>{label}</span>
    </StyledLabelContainer>
  );
};
