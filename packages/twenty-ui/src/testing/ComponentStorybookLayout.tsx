import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledLayout = styled.div<{
  width?: number;
  backgroundColor?: string | undefined;
  height: number | 'fit-content';
  theme: ThemeType;
}>`
  background: ${({ theme, backgroundColor }) =>
    backgroundColor ?? theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 5px;

  display: flex;
  flex-direction: row;

  height: ${({ height }) =>
    height === 'fit-content'
      ? 'fit-content'
      : `
      ${height}px
    `};
  max-width: calc(100% - 40px);
  min-width: ${({ width }) => (width ? 'unset' : '300px')};
  padding: 20px;
  width: ${({ width }) => (width ? width + 'px' : 'fit-content')};
`;

type ComponentStorybookLayoutProps = {
  width?: number;
  backgroundColor?: string | undefined;
  height?: number;
  children: JSX.Element;
};

export const ComponentStorybookLayout = ({
  width,
  backgroundColor,
  height,
  children,
}: ComponentStorybookLayoutProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledLayout
      width={width}
      backgroundColor={backgroundColor}
      height={isDefined(height) ? height : 'fit-content'}
      theme={theme}
    >
      {children}
    </StyledLayout>
  );
};
