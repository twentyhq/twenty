import styled from '@emotion/styled';

const StyledText = styled.span<{ isHighlighted?: boolean }>`
  color: ${({ theme, isHighlighted }) =>
    isHighlighted ? theme.adaptiveColors.blue4 : theme.font.color.tertiary};
`;

export const JsonNodeValue = ({
  valueAsString,
  isHighlighted,
}: {
  valueAsString: string;
  isHighlighted?: boolean;
}) => {
  return <StyledText isHighlighted={isHighlighted}>{valueAsString}</StyledText>;
};
