import styled from '@emotion/styled';
import { Checkmark } from '@ui/display/checkmark/components/Checkmark';
import { type ColorScheme } from '@ui/input/types/ColorScheme';
import { GRAY_SCALE_DARK, GRAY_SCALE_LIGHT } from '@ui/theme';
import {
  AnimatePresence,
  type AnimationControls,
  motion,
  useAnimation,
} from 'framer-motion';
import React from 'react';

const StyledColorSchemeBackground = styled.div<
  Pick<ColorSchemeCardProps, 'variant'>
>`
  align-items: flex-end;
  background: ${({ variant }) => {
    switch (variant) {
      case 'Dark':
        return GRAY_SCALE_DARK.gray4;
      case 'Light':
      default:
        return GRAY_SCALE_LIGHT.gray4;
    }
  }};
  border: ${({ variant }) => {
    switch (variant) {
      case 'Dark':
        return `1px solid ${GRAY_SCALE_DARK.gray5};`;
      case 'Light':
      default:
        return `1px solid ${GRAY_SCALE_LIGHT.gray5};`;
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 80px;
  justify-content: flex-end;
  overflow: hidden;
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(6)};
  width: 160px;
`;

const StyledColorSchemeContent = styled(motion.div)<
  Pick<ColorSchemeCardProps, 'variant'>
>`
  background: ${({ variant }) => {
    switch (variant) {
      case 'Dark':
        return GRAY_SCALE_DARK.gray1;
      case 'Light':
        return GRAY_SCALE_LIGHT.gray1;
    }
  }};

  border-left: ${({ variant }) => {
    switch (variant) {
      case 'Dark':
        return `1px solid ${GRAY_SCALE_DARK.gray5};`;
      case 'Light':
      default:
        return `1px solid ${GRAY_SCALE_LIGHT.gray5};`;
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.md} 0px 0px 0px;
  border-top: ${({ variant }) => {
    switch (variant) {
      case 'Dark':
        return `1px solid ${GRAY_SCALE_DARK.gray5};`;
      case 'Light':
      default:
        return `1px solid ${GRAY_SCALE_LIGHT.gray5};`;
    }
  }};
  box-sizing: border-box;
  color: ${({ variant }) => {
    switch (variant) {
      case 'Dark':
        return GRAY_SCALE_DARK.gray12;
      case 'Light':
      default:
        return GRAY_SCALE_LIGHT.gray12;
    }
  }};
  display: flex;
  flex: 1;
  font-size: 20px;
  height: 56px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export type ColorSchemeSegmentProps = {
  variant: ColorScheme;
  controls: AnimationControls;
  className?: string;
} & React.ComponentPropsWithoutRef<'div'>;

const ColorSchemeSegment = ({
  variant,
  controls,
  style,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ColorSchemeSegmentProps) => (
  <StyledColorSchemeBackground
    className={className}
    {...{ variant, style, onClick, onMouseEnter, onMouseLeave }}
  >
    <StyledColorSchemeContent animate={controls} variant={variant}>
      Aa
    </StyledColorSchemeContent>
  </StyledColorSchemeBackground>
);

const StyledContainer = styled.div`
  position: relative;
  width: 160px;
`;

const StyledMixedColorSchemeSegment = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  height: 80px;
  overflow: hidden;
  position: relative;
  width: 160px;
`;

const StyledCheckmarkContainer = styled(motion.div)`
  bottom: 0px;
  padding: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  right: 0px;
`;

export type ColorSchemeCardProps = {
  variant: ColorScheme;
  selected?: boolean;
} & React.ComponentPropsWithoutRef<'div'>;

const checkmarkAnimationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const ColorSchemeCard = ({
  variant,
  selected,
  onClick,
}: ColorSchemeCardProps) => {
  const controls = useAnimation();

  const handleMouseEnter = () => {
    controls.start({
      height: 61,
      fontSize: '22px',
      transition: { duration: 0.1 },
    });
  };

  const handleMouseLeave = () => {
    controls.start({
      height: 56,
      fontSize: '20px',
      transition: { duration: 0.1 },
    });
  };

  if (variant === 'System') {
    return (
      <StyledContainer>
        <StyledMixedColorSchemeSegment
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={onClick}
        >
          <ColorSchemeSegment
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            controls={controls}
            variant="Light"
          />
          <ColorSchemeSegment
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            controls={controls}
            variant="Dark"
          />
        </StyledMixedColorSchemeSegment>
        <AnimatePresence>
          {selected && (
            <StyledCheckmarkContainer
              key="system"
              variants={checkmarkAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Checkmark />
            </StyledCheckmarkContainer>
          )}
        </AnimatePresence>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <ColorSchemeSegment
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        controls={controls}
        variant={variant}
        onClick={onClick}
      />
      <AnimatePresence>
        {selected && (
          <StyledCheckmarkContainer
            key={variant}
            variants={checkmarkAnimationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Checkmark />
          </StyledCheckmarkContainer>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
};
