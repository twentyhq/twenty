import { styled } from '@linaria/react';
import type { CSSProperties, ComponentType, ComponentProps } from 'react';

import { VISUAL_TOKENS } from './homeVisualTokens';

type HomeVisualButtonIcon = ComponentType<{
  className?: string;
  color?: string;
  size?: number | string;
  stroke?: number | string;
  style?: CSSProperties;
}>;

type HomeVisualButtonProps = {
  Icon?: HomeVisualButtonIcon;
  title?: string;
  hotkeys?: string[];
  className?: string;
} & Pick<ComponentProps<'button'>, 'aria-label' | 'tabIndex' | 'type'>;

const StyledButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${VISUAL_TOKENS.background.transparent.medium};
  border-radius: ${VISUAL_TOKENS.border.radius.sm};
  color: ${VISUAL_TOKENS.font.color.secondary};
  cursor: default;
  display: inline-flex;
  flex-direction: row;
  font-family: ${VISUAL_TOKENS.font.family};
  font-size: ${VISUAL_TOKENS.font.size.md};
  font-weight: ${VISUAL_TOKENS.font.weight.medium};
  gap: ${VISUAL_TOKENS.spacing[1]};
  height: 24px;
  padding: 0 ${VISUAL_TOKENS.spacing[2]};
  transition: background 0.1s ease;
  white-space: nowrap;

  &:hover {
    background: ${VISUAL_TOKENS.background.transparent.light};
  }

  &:active {
    background: ${VISUAL_TOKENS.background.transparent.light};
  }
`;

const StyledIconWrapper = styled.div`
  align-items: center;
  color: currentColor;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const StyledLabel = styled.div`
  white-space: nowrap;
`;

const StyledSeparator = styled.div`
  background: ${VISUAL_TOKENS.background.transparent.light};
  border-radius: ${VISUAL_TOKENS.border.radius.pill};
  height: 100%;
  width: 1px;
`;

const StyledShortcutLabel = styled.div`
  color: ${VISUAL_TOKENS.font.color.light};
  font-weight: ${VISUAL_TOKENS.font.weight.medium};
  white-space: nowrap;
`;

export const HomeVisualButton = ({
  Icon,
  title,
  hotkeys,
  className,
  'aria-label': ariaLabel,
  tabIndex = -1,
  type = 'button',
}: HomeVisualButtonProps) => {
  const hasHotkeys = Array.isArray(hotkeys) && hotkeys.length > 0;

  return (
    <StyledButton
      aria-label={ariaLabel}
      className={className}
      tabIndex={tabIndex}
      type={type}
    >
      {Icon ? (
        <StyledIconWrapper>
          <Icon
            size={VISUAL_TOKENS.icon.size.sm}
            stroke={VISUAL_TOKENS.icon.stroke.sm}
          />
        </StyledIconWrapper>
      ) : null}
      {title ? <StyledLabel>{title}</StyledLabel> : null}
      {hasHotkeys ? <StyledSeparator /> : null}
      {hasHotkeys ? (
        <StyledShortcutLabel>{hotkeys.join('')}</StyledShortcutLabel>
      ) : null}
    </StyledButton>
  );
};
