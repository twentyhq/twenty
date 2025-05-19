import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledLayout = styled.div<{
  width?: number;
  backgroundColor?: string | undefined;
  height: number | 'fit-content';
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
}: ComponentStorybookLayoutProps) => (
  <StyledLayout
    width={width}
    backgroundColor={backgroundColor}
    height={isDefined(height) ? height : 'fit-content'}
  >
    {children}
  </StyledLayout>
);
