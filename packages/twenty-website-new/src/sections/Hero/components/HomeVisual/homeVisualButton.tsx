import { styled } from '@linaria/react';
import type { CSSProperties, ComponentType, ComponentProps } from 'react';
import { themeCssVariables } from '../../../../../../twenty-ui/src/theme-constants/themeCssVariables';

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
  border: 1px solid ${themeCssVariables.background.transparent.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: default;
  display: inline-flex;
  flex-direction: row;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  padding: 0 ${themeCssVariables.spacing[2]};
  transition: background 0.1s ease;
  white-space: nowrap;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &:active {
    background: ${themeCssVariables.background.transparent.light};
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
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  height: 100%;
  width: 1px;
`;

const StyledShortcutLabel = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-weight: ${themeCssVariables.font.weight.medium};
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
            size={themeCssVariables.icon.size.sm}
            stroke={themeCssVariables.icon.stroke.sm}
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
