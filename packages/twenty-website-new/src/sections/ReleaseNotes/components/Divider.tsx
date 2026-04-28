import { theme } from '@/theme';
import { styled } from '@linaria/react';

const DividerOuter = styled.div`
  margin: ${theme.spacing(10)} 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
    justify-content: flex-end;
  }
`;

const DividerLine = styled.div`
  background-color: ${theme.colors.primary.border[20]};
  height: 1px;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: calc(132px + ${theme.spacing(10)});
    width: auto;
    flex: 1 1 0;
  }
`;

export function Divider() {
  return (
    <DividerOuter aria-hidden>
      <DividerLine />
    </DividerOuter>
  );
}
