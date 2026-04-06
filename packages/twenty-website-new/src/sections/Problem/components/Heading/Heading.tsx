import {
  Heading as BaseHeading,
  type HeadingProps,
} from "@/design-system/components/Heading/Heading";
import { theme } from "@/theme";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";

const problemHeadingClassName = css`
  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(10)});

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: calc(${theme.spacing(2)} - ${theme.spacing(16)});
  }
`;

const HeadingWrapper = styled.div`
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: scale(1.02);
  }
`;

export function Heading({
  as = "h2",
  size = "md",
  weight = "light",
  ...props
}: HeadingProps) {
  return (
    <HeadingWrapper>
      <BaseHeading
        className={problemHeadingClassName}
        as={as}
        size={size}
        weight={weight}
        {...props}
      />
    </HeadingWrapper>
  );
}
