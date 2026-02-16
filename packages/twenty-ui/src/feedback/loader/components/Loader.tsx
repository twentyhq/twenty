import styled from '@emotion/styled';
import { type ThemeColor } from '@ui/theme';
import { motion } from 'framer-motion';

const StyledLoaderContainer = styled.div<{
  color?: ThemeColor;
}>`
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: ${({ theme }) => theme.spacing(6)};
  height: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  border: 1px solid
    ${({ color, theme }) =>
      color
        ? theme.tag.text[color]
        : `var(--tw-button-color, ${theme.font.color.tertiary})`};
  overflow: hidden;
`;

const StyledLoader = styled(motion.div)<{
  color?: ThemeColor;
}>`
  background-color: ${({ color, theme }) =>
    color
      ? theme.tag.text[color]
      : `var(--tw-button-color, ${theme.font.color.tertiary})`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  height: 8px;
  width: 8px;
`;

type LoaderProps = {
  color?: ThemeColor;
};

export const Loader = ({ color }: LoaderProps) => (
  <StyledLoaderContainer color={color}>
    <StyledLoader
      color={color}
      animate={{
        x: [-16, 0, 16],
        width: [8, 12, 8],
        height: [8, 2, 8],
      }}
      transition={{
        duration: 0.8,
        times: [0, 0.15, 0.3],
        repeat: Infinity,
      }}
    />
  </StyledLoaderContainer>
);
