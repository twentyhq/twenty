import styled from '@emotion/styled';

const StyledRectangleIllustrationIcon = styled('div')`
  background-color: ${({ theme }) => theme.background.primary};
  border: solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  justify-content: center;
  size: auto;
  box-sizing: content-box;
`;

export const IllustrationIconWrapper = StyledRectangleIllustrationIcon;
