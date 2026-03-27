import { styled } from "@linaria/react";
import type { ReactNode } from "react";

const StyledLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: inherit;
  position: relative;
  overflow: clip;
  flex-shrink: 0;
`;

type LogoProps = {
  children: ReactNode;
}

export function Logo({ children }: LogoProps) {
  return <StyledLogo>{children}</StyledLogo>;
}
