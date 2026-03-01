import { type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';

type SectionProps = {
  children: ReactNode;
  className?: string;
  alignment?: SectionAlignment;
  fullWidth?: boolean;
  fontColor?: SectionFontColor;
};

export enum SectionAlignment {
  Left = 'left',
  Center = 'center',
}

export enum SectionFontColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

const StyledSection = styled.div<{
  alignment: SectionAlignment;
  fullWidth: boolean;
  fontColor: SectionFontColor;
}>`
  color: ${({ fontColor }) =>
    fontColor === 'primary'
      ? themeCssVariables.font.color.primary
      : fontColor === 'secondary'
        ? themeCssVariables.font.color.secondary
        : themeCssVariables.font.color.tertiary};
  text-align: ${({ alignment }) => alignment};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export const Section = ({
  children,
  className,
  alignment = SectionAlignment.Left,
  fullWidth = true,
  fontColor = SectionFontColor.Primary,
}: SectionProps) => {
  return (
    <StyledSection
      className={className}
      alignment={alignment}
      fullWidth={fullWidth}
      fontColor={fontColor}
    >
      {children}
    </StyledSection>
  );
};
