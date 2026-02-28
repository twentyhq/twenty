import { type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';

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
  color: ${({ fontColor }) => themeVar.font.color[fontColor]};
  font-size: ${themeVar.font.size.lg};
  font-weight: ${themeVar.font.weight.semiBold};
  line-height: ${themeVar.text.lineHeight.md};
  margin: 0;
  margin-bottom: ${themeVar.spacing[4]};
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
