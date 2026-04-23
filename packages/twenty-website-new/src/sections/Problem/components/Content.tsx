import { theme } from "@/theme";
import { styled } from "@linaria/react";
import type { ReactNode } from "react";

const StyledContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(10)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(15)};
    padding-left: ${theme.spacing(15)};
    padding-right: ${theme.spacing(15)};
    padding-top: ${theme.spacing(15)};
    row-gap: ${theme.spacing(20)};
  }
`;

type ContentProps = {
  children: ReactNode;
};

export function Content({ children }: ContentProps) {
  return <StyledContent>{children}</StyledContent>;
}
