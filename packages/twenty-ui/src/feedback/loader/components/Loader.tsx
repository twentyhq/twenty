import { styled } from '@linaria/react';
import { type ThemeColor, ThemeContext, type ThemeType } from '@ui/theme';
import { motion } from 'framer-motion';
import { useContext } from 'react';

const StyledLoaderContainer = styled.div<{
  color?: ThemeColor;
  theme: ThemeType;
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

const StyledLoaderBase = styled.div<{
  color?: ThemeColor;
  theme: ThemeType;
}>`
  background-color: ${({ color, theme }) =>
    color
      ? theme.tag.text[color]
      : `var(--tw-button-color, ${theme.font.color.tertiary})`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  height: 8px;
  width: 8px;
`;

const StyledLoader = motion.create(StyledLoaderBase);

type LoaderProps = {
  color?: ThemeColor;
};

export const Loader = ({ color }: LoaderProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledLoaderContainer color={color} theme={theme}>
      <StyledLoader
        color={color}
        theme={theme}
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
};
