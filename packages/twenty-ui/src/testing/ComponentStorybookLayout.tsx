import styled from '@emotion/styled';

const StyledLayout = styled.div<{
  width?: number;
  backgroundColor?: string | undefined;
  height?: number;
}>`
  background: ${({ theme, backgroundColor }) =>
    backgroundColor ?? theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 5px;

  display: flex;
  flex-direction: row;

  height: fit-content;
  max-width: calc(100% - 40px);
  min-width: ${({ width }) => (width ? 'unset' : '300px')};
  padding: 20px;
  width: ${({ width }) => (width ? width + 'px' : 'fit-content')};
`;

type ComponentStorybookLayoutProps = {
  width?: number;
  backgroundColor?: string | undefined;
  height?: number | 'auto';
  children: JSX.Element;
};

export const ComponentStorybookLayout = ({
  width,
  backgroundColor,
  height = 'auto',
  children,
}: ComponentStorybookLayoutProps) => (
  <StyledLayout width={width} backgroundColor={backgroundColor} height={height}>
    {children}
  </StyledLayout>
);
