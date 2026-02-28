import {
  forwardRef,
  type ReactElement,
  type ReactNode,
  useContext,
} from 'react';
import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';

type StyledTextProps = {
  PrefixComponent?: ReactElement;
  text: ReactNode;
  color?: string;
};

const useThemeFromContext = () => {
  const { theme } = useContext(ThemeContext);
  return theme;
};

const StyledTextContentInner = styled.div<{ theme: ThemeType }>`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};

  overflow: hidden;
  padding-left: 0;

  white-space: nowrap;
`;

export const StyledTextContent = forwardRef<
  HTMLDivElement,
  { theme?: ThemeType } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledTextContentInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledTextContent.displayName = 'StyledTextContent';

const StyledTextWrapperInner = styled.div<{
  color?: string;
  theme: ThemeType;
}>`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};

  cursor: initial;

  display: flex;

  flex-direction: row;

  font-size: ${({ theme }) => theme.font.size.sm};

  gap: ${({ theme }) => theme.spacing(2)};

  padding: var(--vertical-padding) 0;

  color: ${({ theme, color }) => color ?? theme.font.color.primary};
`;

export const StyledTextWrapper = forwardRef<
  HTMLDivElement,
  {
    theme?: ThemeType;
    color?: string;
  } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledTextWrapperInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledTextWrapper.displayName = 'StyledTextWrapper';

export const StyledText = ({
  PrefixComponent,
  text,
  color,
}: StyledTextProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledTextWrapper color={color} theme={theme}>
      {PrefixComponent ? PrefixComponent : null}
      <StyledTextContent theme={theme}>{text}</StyledTextContent>
    </StyledTextWrapper>
  );
};
