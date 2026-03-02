import { styled } from '@linaria/react';
import { type ThemeColor, themeCssVariables } from '@ui/theme';
import { motion } from 'framer-motion';

const StyledLoaderContainer = styled.div<{
  color?: ThemeColor;
}>`
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: ${themeCssVariables.spacing[6]};
  height: ${themeCssVariables.spacing[3]};
  border-radius: ${themeCssVariables.border.radius.pill};
  border: 1px solid
    ${({ color }) =>
      color
        ? themeCssVariables.tag.text[color]
        : `var(--tw-button-color, ${themeCssVariables.font.color.tertiary})`};
  overflow: hidden;
`;

const StyledLoaderBase = styled.div<{
  color?: ThemeColor;
}>`
  background-color: ${({ color }) =>
    color
      ? themeCssVariables.tag.text[color]
      : `var(--tw-button-color, ${themeCssVariables.font.color.tertiary})`};
  border-radius: ${themeCssVariables.border.radius.pill};
  height: 8px;
  width: 8px;
`;

const StyledLoader = motion.create(StyledLoaderBase);

type LoaderProps = {
  color?: ThemeColor;
};

export const Loader = ({ color }: LoaderProps) => {
  return (
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
};
