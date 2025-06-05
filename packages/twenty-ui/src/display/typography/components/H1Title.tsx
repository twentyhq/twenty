import styled from '@emotion/styled';
import { ReactNode } from 'react';

type H1TitleProps = {
  title: ReactNode;
  fontColor?: H1TitleFontColor;
  titleCentered?: boolean;
  className?: string;
};

export enum H1TitleFontColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

const StyledTitle = styled.h2<{
  fontColor: H1TitleFontColor;
  titleCentered?: boolean;
}>`
  color: ${({ theme, fontColor }) => theme.font.color[fontColor]};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  text-align: ${({ titleCentered }) => (titleCentered ? 'center' : 'start')};
`;

export const H1Title = ({
  title,
  fontColor = H1TitleFontColor.Tertiary,
  titleCentered = false,
  className,
}: H1TitleProps) => {
  return (
    <StyledTitle
      fontColor={fontColor}
      className={className}
      titleCentered={titleCentered}
    >
      {title}
    </StyledTitle>
  );
};
