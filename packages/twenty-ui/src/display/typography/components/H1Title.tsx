import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

type H1TitleProps = {
  title: ReactNode;
  fontColor?: H1TitleFontColor;
  className?: string;
};

export enum H1TitleFontColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

const StyledTitle = styled.h2<{
  fontColor: H1TitleFontColor;
}>`
  color: ${({ fontColor }) => `var(--font-color-${fontColor})`};
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semi-bold);
  line-height: var(--line-height-md);
  margin: 0;
  margin-bottom: var(--spacing-4);
`;

export const H1Title = ({
  title,
  fontColor = H1TitleFontColor.Tertiary,
  className,
}: H1TitleProps) => {
  return (
    <StyledTitle fontColor={fontColor} className={className}>
      {title}
    </StyledTitle>
  );
};
