import { forwardRef, type ReactElement, type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';

type StyledTextProps = {
  PrefixComponent?: ReactElement;
  text: ReactNode;
  color?: string;
};

const StyledTextContentInner = styled.div`
  font-size: ${themeVar.font.size.sm};
  font-weight: ${themeVar.font.weight.regular};

  overflow: hidden;
  padding-left: 0;

  white-space: nowrap;
`;

export const StyledTextContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  return (
    <StyledTextContentInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      ref={ref}
    />
  );
});
StyledTextContent.displayName = 'StyledTextContent';

const StyledTextWrapperInner = styled.div<{
  color?: string;
}>`
  --horizontal-padding: ${themeVar.spacing[1]};
  --vertical-padding: ${themeVar.spacing[2]};

  cursor: initial;

  display: flex;

  flex-direction: row;

  font-size: ${themeVar.font.size.sm};

  gap: ${themeVar.spacing[2]};

  padding: var(--vertical-padding) 0;

  color: ${({ color }) => color ?? themeVar.font.color.primary};
`;

export const StyledTextWrapper = forwardRef<
  HTMLDivElement,
  {
    color?: string;
  } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  return (
    <StyledTextWrapperInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
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
  return (
    <StyledTextWrapper color={color}>
      {PrefixComponent ? PrefixComponent : null}
      <StyledTextContent>{text}</StyledTextContent>
    </StyledTextWrapper>
  );
};
